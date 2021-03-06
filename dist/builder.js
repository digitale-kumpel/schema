'use strict'
Object.defineProperty(exports, '__esModule', { value: true })
exports.generateSchema = exports.makeSchema = exports.makeSchemaInternal = exports.SchemaBuilder = void 0
const tslib_1 = require('tslib')
const graphql_1 = require('graphql')
const args_1 = require('./definitions/args')
const definitionBlocks_1 = require('./definitions/definitionBlocks')
const interfaceType_1 = require('./definitions/interfaceType')
const objectType_1 = require('./definitions/objectType')
const unionType_1 = require('./definitions/unionType')
const wrapping_1 = require('./definitions/wrapping')
const extensions_1 = require('./extensions')
const plugin_1 = require('./plugin')
const fieldAuthorizePlugin_1 = require('./plugins/fieldAuthorizePlugin')
const typegenMetadata_1 = require('./typegenMetadata')
const typegenUtils_1 = require('./typegenUtils')
const utils_1 = require('./utils')
const SCALARS = {
  String: graphql_1.GraphQLString,
  Int: graphql_1.GraphQLInt,
  Float: graphql_1.GraphQLFloat,
  ID: graphql_1.GraphQLID,
  Boolean: graphql_1.GraphQLBoolean,
}
/**
 * Builds all of the types, properly accounts for any using "mix".
 * Since the enum types are resolved synchronously, these need to guard for
 * circular references at this step, while fields will guard for it during lazy evaluation.
 */
class SchemaBuilder {
  constructor(config) {
    this.config = config
    /**
     * Used to check for circular references.
     */
    this.buildingTypes = new Set()
    /**
     * The "final type" map contains all types as they are built.
     */
    this.finalTypeMap = {}
    /**
     * The "defined type" map keeps track of all of the types that were
     * defined directly as `GraphQL*Type` objects, so we don't accidentally
     * overwrite any.
     */
    this.definedTypeMap = {}
    /**
     * The "pending type" map keeps track of all types that were defined w/
     * GraphQL Nexus and haven't been processed into concrete types yet.
     */
    this.pendingTypeMap = {}
    /**
     * All "extensions" to types (adding fields on types from many locations)
     */
    this.typeExtendMap = {}
    /**
     * All "extensions" to input types (adding fields on types from many locations)
     */
    this.inputTypeExtendMap = {}
    /**
     * Configures the root-level nonNullDefaults defaults
     */
    this.nonNullDefaults = {}
    this.dynamicInputFields = {}
    this.dynamicOutputFields = {}
    this.dynamicOutputProperties = {}
    this.plugins = []
    /**
     * All types that need to be traversed for children types
     */
    this.typesToWalk = []
    /**
     * Root type mapping information annotated on the type definitions
     */
    this.rootTypings = {}
    /**
     * Array of missing types
     */
    this.missingTypes = {}
    /**
     * Created just before types are walked, this keeps track of all of the resolvers
     */
    this.onMissingTypeFns = []
    /**
     * Executed just before types are walked
     */
    this.onBeforeBuildFns = []
    /**
     * Executed as the field resolvers are included on the field
     */
    this.onCreateResolverFns = []
    /**
     * Executed as the field "subscribe" fields are included on the schema
     */
    this.onCreateSubscribeFns = []
    /**
     * Executed after the schema is constructed, for any final verification
     */
    this.onAfterBuildFns = []
    this.setConfigOption = (key, value) => {
      this.config = Object.assign(Object.assign({}, this.config), { [key]: value })
    }
    this.hasConfigOption = (key) => {
      return this.config.hasOwnProperty(key)
    }
    this.getConfigOption = (key) => {
      return this.config[key]
    }
    this.hasType = (typeName) => {
      return Boolean(this.pendingTypeMap[typeName] || this.finalTypeMap[typeName])
    }
    /**
     * Add type takes a Nexus type, or a GraphQL type and pulls
     * it into an internal "type registry". It also does an initial pass
     * on any types that are referenced on the "types" field and pulls
     * those in too, so you can define types anonymously, without
     * exporting them.
     */
    this.addType = (typeDef) => {
      var _a
      if (wrapping_1.isNexusDynamicInputMethod(typeDef)) {
        this.dynamicInputFields[typeDef.name] = typeDef
        return
      }
      if (wrapping_1.isNexusDynamicOutputMethod(typeDef)) {
        this.dynamicOutputFields[typeDef.name] = typeDef
        return
      }
      if (wrapping_1.isNexusDynamicOutputProperty(typeDef)) {
        this.dynamicOutputProperties[typeDef.name] = typeDef
        return
      }
      // Don't worry about internal types.
      if (((_a = typeDef.name) === null || _a === void 0 ? void 0 : _a.indexOf('__')) === 0) {
        return
      }
      const existingType = this.definedTypeMap[typeDef.name] || this.pendingTypeMap[typeDef.name]
      if (wrapping_1.isNexusExtendTypeDef(typeDef)) {
        const typeExtensions = (this.typeExtendMap[typeDef.name] = this.typeExtendMap[typeDef.name] || [])
        typeExtensions.push(typeDef.value)
        this.typesToWalk.push({ type: 'object', value: typeDef.value })
        return
      }
      if (wrapping_1.isNexusExtendInputTypeDef(typeDef)) {
        const typeExtensions = (this.inputTypeExtendMap[typeDef.name] =
          this.inputTypeExtendMap[typeDef.name] || [])
        typeExtensions.push(typeDef.value)
        this.typesToWalk.push({ type: 'input', value: typeDef.value })
        return
      }
      if (existingType) {
        // Allow importing the same exact type more than once.
        if (existingType === typeDef) {
          return
        }
        throw extendError(typeDef.name)
      }
      if (wrapping_1.isNexusScalarTypeDef(typeDef) && typeDef.value.asNexusMethod) {
        this.dynamicInputFields[typeDef.value.asNexusMethod] = typeDef.name
        this.dynamicOutputFields[typeDef.value.asNexusMethod] = typeDef.name
        if (typeDef.value.rootTyping) {
          this.rootTypings[typeDef.name] = typeDef.value.rootTyping
        }
      } else if (graphql_1.isScalarType(typeDef)) {
        const scalarDef = typeDef
        if (scalarDef.extensions && scalarDef.extensions.nexus) {
          const { asNexusMethod, rootTyping } = scalarDef.extensions.nexus
          if (asNexusMethod) {
            this.dynamicInputFields[asNexusMethod] = scalarDef.name
            this.dynamicOutputFields[asNexusMethod] = typeDef.name
          }
          if (rootTyping) {
            this.rootTypings[scalarDef.name] = rootTyping
          }
        }
      }
      if (graphql_1.isNamedType(typeDef)) {
        let finalTypeDef = typeDef
        if (graphql_1.isObjectType(typeDef)) {
          const config = typeDef.toConfig()
          finalTypeDef = new graphql_1.GraphQLObjectType(
            Object.assign(Object.assign({}, config), {
              fields: () => this.rebuildNamedOutputFields(config),
              interfaces: () => config.interfaces.map((t) => this.getInterface(t.name)),
            })
          )
        } else if (graphql_1.isInterfaceType(typeDef)) {
          const config = typeDef.toConfig()
          finalTypeDef = new graphql_1.GraphQLInterfaceType(
            Object.assign(Object.assign({}, config), { fields: () => this.rebuildNamedOutputFields(config) })
          )
        } else if (graphql_1.isUnionType(typeDef)) {
          const config = typeDef.toConfig()
          finalTypeDef = new graphql_1.GraphQLUnionType(
            Object.assign(Object.assign({}, config), {
              types: () => config.types.map((t) => this.getObjectType(t.name)),
            })
          )
        }
        this.finalTypeMap[typeDef.name] = finalTypeDef
        this.definedTypeMap[typeDef.name] = typeDef
        this.typesToWalk.push({ type: 'named', value: typeDef })
      } else {
        this.pendingTypeMap[typeDef.name] = typeDef
      }
      if (wrapping_1.isNexusInputObjectTypeDef(typeDef)) {
        this.typesToWalk.push({ type: 'input', value: typeDef.value })
      }
      if (wrapping_1.isNexusObjectTypeDef(typeDef)) {
        this.typesToWalk.push({ type: 'object', value: typeDef.value })
      }
      if (wrapping_1.isNexusInterfaceTypeDef(typeDef)) {
        this.typesToWalk.push({ type: 'interface', value: typeDef.value })
      }
    }
    this.nonNullDefaults = Object.assign({ input: false, output: true }, config.nonNullDefaults)
    this.plugins = config.plugins || [fieldAuthorizePlugin_1.fieldAuthorizePlugin()]
    this.builderLens = Object.freeze({
      hasType: this.hasType,
      addType: this.addType,
      setConfigOption: this.setConfigOption,
      hasConfigOption: this.hasConfigOption,
      getConfigOption: this.getConfigOption,
    })
  }
  get schemaExtension() {
    /* istanbul ignore next */
    if (!this._schemaExtension) {
      throw new Error('Cannot reference schemaExtension before it is created')
    }
    return this._schemaExtension
  }
  addTypes(types) {
    var _a
    if (!types) {
      return
    }
    if (graphql_1.isSchema(types)) {
      this.addTypes(types.getTypeMap())
    }
    if (wrapping_1.isNexusPlugin(types)) {
      if (!((_a = this.config.plugins) === null || _a === void 0 ? void 0 : _a.includes(types))) {
        throw new Error(
          `Nexus plugin ${types.config.name} was seen in the "types" config, but should instead be provided to the "plugins" array.`
        )
      }
      return
    }
    if (
      wrapping_1.isNexusNamedTypeDef(types) ||
      wrapping_1.isNexusExtendTypeDef(types) ||
      wrapping_1.isNexusExtendInputTypeDef(types) ||
      graphql_1.isNamedType(types) ||
      wrapping_1.isNexusDynamicInputMethod(types) ||
      wrapping_1.isNexusDynamicOutputMethod(types) ||
      wrapping_1.isNexusDynamicOutputProperty(types)
    ) {
      this.addType(types)
    } else if (Array.isArray(types)) {
      types.forEach((typeDef) => this.addTypes(typeDef))
    } else if (utils_1.isObject(types)) {
      Object.keys(types).forEach((key) => this.addTypes(types[key]))
    }
  }
  rebuildNamedOutputFields(config) {
    const { fields } = config,
      rest = tslib_1.__rest(config, ['fields'])
    const fieldsConfig = typeof fields === 'function' ? fields() : fields
    return utils_1.mapValues(fieldsConfig, (val, key) => {
      const { resolve, type } = val,
        fieldConfig = tslib_1.__rest(val, ['resolve', 'type'])
      const finalType = this.replaceNamedType(type)
      return Object.assign(Object.assign({}, fieldConfig), {
        type: finalType,
        resolve: this.makeFinalResolver(
          {
            builder: this.builderLens,
            fieldConfig: Object.assign(Object.assign({}, fieldConfig), { type: finalType, name: key }),
            schemaConfig: this.config,
            parentTypeConfig: rest,
            schemaExtension: this.schemaExtension,
          },
          resolve
        ),
      })
    })
  }
  walkTypes() {
    let obj
    while ((obj = this.typesToWalk.shift())) {
      switch (obj.type) {
        case 'input':
          this.walkInputType(obj.value)
          break
        case 'interface':
          this.walkInterfaceType(obj.value)
          break
        case 'named':
          this.walkNamedTypes(obj.value)
          break
        case 'object':
          this.walkOutputType(obj.value)
          break
        default:
          utils_1.casesHandled(obj)
      }
    }
  }
  beforeWalkTypes() {
    this.plugins.forEach((obj, i) => {
      if (!wrapping_1.isNexusPlugin(obj)) {
        throw new Error(`Expected a plugin in plugins[${i}], saw ${obj}`)
      }
      const { config: pluginConfig } = obj
      if (pluginConfig.onInstall) {
        const installResult = pluginConfig.onInstall(this.builderLens)
        utils_1.validateOnInstallHookResult(pluginConfig.name, installResult)
        installResult.types.forEach((t) => this.addType(t))
      }
      if (pluginConfig.onCreateFieldResolver) {
        this.onCreateResolverFns.push(pluginConfig.onCreateFieldResolver)
      }
      if (pluginConfig.onCreateFieldSubscribe) {
        this.onCreateSubscribeFns.push(pluginConfig.onCreateFieldSubscribe)
      }
      if (pluginConfig.onBeforeBuild) {
        this.onBeforeBuildFns.push(pluginConfig.onBeforeBuild)
      }
      if (pluginConfig.onMissingType) {
        this.onMissingTypeFns.push(pluginConfig.onMissingType)
      }
      if (pluginConfig.onAfterBuild) {
        this.onAfterBuildFns.push(pluginConfig.onAfterBuild)
      }
    })
  }
  beforeBuildTypes() {
    this.onBeforeBuildFns.forEach((fn) => {
      fn(this.builderLens)
      if (this.typesToWalk.length > 0) {
        this.walkTypes()
      }
    })
  }
  buildNexusTypes() {
    // If Query isn't defined, set it to null so it falls through to "missingType"
    if (!this.pendingTypeMap.Query) {
      this.pendingTypeMap.Query = null
    }
    Object.keys(this.pendingTypeMap).forEach((key) => {
      if (this.typesToWalk.length > 0) {
        this.walkTypes()
      }
      // If we've already constructed the type by this point,
      // via circular dependency resolution don't worry about building it.
      if (this.finalTypeMap[key]) {
        return
      }
      if (this.definedTypeMap[key]) {
        throw extendError(key)
      }
      this.finalTypeMap[key] = this.getOrBuildType(key)
      this.buildingTypes.clear()
    })
    Object.keys(this.typeExtendMap).forEach((key) => {
      // If we haven't defined the type, assume it's an object type
      if (this.typeExtendMap[key] !== null) {
        this.buildObjectType({
          name: key,
          definition() {},
        })
      }
    })
    Object.keys(this.inputTypeExtendMap).forEach((key) => {
      // If we haven't defined the type, assume it's an input object type
      if (this.inputTypeExtendMap[key] !== null) {
        this.buildInputObjectType({
          name: key,
          definition() {},
        })
      }
    })
  }
  createSchemaExtension() {
    this._schemaExtension = new extensions_1.NexusSchemaExtension(
      Object.assign(Object.assign({}, this.config), {
        dynamicFields: {
          dynamicInputFields: this.dynamicInputFields,
          dynamicOutputFields: this.dynamicOutputFields,
          dynamicOutputProperties: this.dynamicOutputProperties,
        },
        rootTypings: this.rootTypings,
      })
    )
  }
  getFinalTypeMap() {
    this.beforeWalkTypes()
    this.createSchemaExtension()
    this.walkTypes()
    this.beforeBuildTypes()
    this.buildNexusTypes()
    return {
      finalConfig: this.config,
      typeMap: this.finalTypeMap,
      schemaExtension: this.schemaExtension,
      missingTypes: this.missingTypes,
      onAfterBuildFns: this.onAfterBuildFns,
    }
  }
  buildInputObjectType(config) {
    const fields = []
    const definitionBlock = new definitionBlocks_1.InputDefinitionBlock({
      typeName: config.name,
      addField: (field) => fields.push(field),
      addDynamicInputFields: (block, isList) => this.addDynamicInputFields(block, isList),
      warn: utils_1.consoleWarn,
    })
    config.definition(definitionBlock)
    const extensions = this.inputTypeExtendMap[config.name]
    if (extensions) {
      extensions.forEach((extension) => {
        extension.definition(definitionBlock)
      })
    }
    this.inputTypeExtendMap[config.name] = null
    const inputObjectTypeConfig = {
      name: config.name,
      fields: () => this.buildInputObjectFields(fields, inputObjectTypeConfig),
      description: config.description,
      extensions: {
        nexus: new extensions_1.NexusInputObjectTypeExtension(config),
      },
    }
    return this.finalize(new graphql_1.GraphQLInputObjectType(inputObjectTypeConfig))
  }
  buildObjectType(config) {
    const fields = []
    const interfaces = []
    const definitionBlock = new objectType_1.ObjectDefinitionBlock({
      typeName: config.name,
      addField: (fieldDef) => fields.push(fieldDef),
      addInterfaces: (interfaceDefs) => interfaces.push(...interfaceDefs),
      addDynamicOutputMembers: (block, isList) => this.addDynamicOutputMembers(block, isList, 'build'),
      warn: utils_1.consoleWarn,
    })
    config.definition(definitionBlock)
    const extensions = this.typeExtendMap[config.name]
    if (extensions) {
      extensions.forEach((extension) => {
        extension.definition(definitionBlock)
      })
    }
    this.typeExtendMap[config.name] = null
    if (config.rootTyping) {
      this.rootTypings[config.name] = config.rootTyping
    }
    const objectTypeConfig = {
      name: config.name,
      interfaces: () => interfaces.map((i) => this.getInterface(i)),
      description: config.description,
      fields: () => {
        const allInterfaces = interfaces.map((i) => this.getInterface(i))
        const interfaceConfigs = allInterfaces.map((i) => i.toConfig())
        const interfaceFieldsMap = {}
        interfaceConfigs.forEach((i) => {
          Object.keys(i.fields).forEach((iFieldName) => {
            interfaceFieldsMap[iFieldName] = i.fields[iFieldName]
          })
        })
        return this.buildOutputFields(fields, objectTypeConfig, interfaceFieldsMap)
      },
      extensions: {
        nexus: new extensions_1.NexusObjectTypeExtension(config),
      },
    }
    return this.finalize(new graphql_1.GraphQLObjectType(objectTypeConfig))
  }
  buildInterfaceType(config) {
    const { name, description } = config
    let resolveType
    const fields = []
    const definitionBlock = new interfaceType_1.InterfaceDefinitionBlock({
      typeName: config.name,
      addField: (field) => fields.push(field),
      setResolveType: (fn) => (resolveType = fn),
      addDynamicOutputMembers: (block, isList) => this.addDynamicOutputMembers(block, isList, 'build'),
      warn: utils_1.consoleWarn,
    })
    config.definition(definitionBlock)
    const toExtend = this.typeExtendMap[config.name]
    if (toExtend) {
      toExtend.forEach((e) => {
        e.definition(definitionBlock)
      })
    }
    if (!resolveType) {
      resolveType = this.missingResolveType(config.name, 'union')
    }
    if (config.rootTyping) {
      this.rootTypings[config.name] = config.rootTyping
    }
    const interfaceTypeConfig = {
      name,
      resolveType,
      description,
      fields: () => this.buildOutputFields(fields, interfaceTypeConfig, {}),
      extensions: {
        nexus: new extensions_1.NexusInterfaceTypeExtension(config),
      },
    }
    return this.finalize(new graphql_1.GraphQLInterfaceType(interfaceTypeConfig))
  }
  buildEnumType(config) {
    const { members } = config
    const values = {}
    if (Array.isArray(members)) {
      members.forEach((m) => {
        if (typeof m === 'string') {
          values[m] = { value: m }
        } else {
          values[m.name] = {
            value: typeof m.value === 'undefined' ? m.name : m.value,
            deprecationReason: m.deprecation,
            description: m.description,
          }
        }
      })
    } else {
      Object.keys(members)
        // members can potentially be a TypeScript enum.
        // The compiled version of this enum will be the members object,
        // numeric enums members also get a reverse mapping from enum values to enum names.
        // In these cases we have to ensure we don't include these reverse mapping keys.
        // See: https://www.typescriptlang.org/docs/handbook/enums.html
        .filter((key) => isNaN(+key))
        .forEach((key) => {
          graphql_1.assertValidName(key)
          values[key] = {
            value: members[key],
          }
        })
    }
    if (!Object.keys(values).length) {
      throw new Error(`GraphQL Nexus: Enum ${config.name} must have at least one member`)
    }
    if (config.rootTyping) {
      this.rootTypings[config.name] = config.rootTyping
    }
    return this.finalize(
      new graphql_1.GraphQLEnumType({
        name: config.name,
        values: values,
        description: config.description,
      })
    )
  }
  buildUnionType(config) {
    let members
    let resolveType
    config.definition(
      new unionType_1.UnionDefinitionBlock({
        setResolveType: (fn) => (resolveType = fn),
        addUnionMembers: (unionMembers) => (members = unionMembers),
      })
    )
    if (!resolveType) {
      resolveType = this.missingResolveType(config.name, 'union')
    }
    if (config.rootTyping) {
      this.rootTypings[config.name] = config.rootTyping
    }
    return this.finalize(
      new graphql_1.GraphQLUnionType({
        name: config.name,
        resolveType,
        description: config.description,
        types: () => this.buildUnionMembers(config.name, members),
      })
    )
  }
  buildScalarType(config) {
    if (config.rootTyping) {
      this.rootTypings[config.name] = config.rootTyping
    }
    return this.finalize(new graphql_1.GraphQLScalarType(config))
  }
  finalize(type) {
    this.finalTypeMap[type.name] = type
    return type
  }
  missingType(typeName, fromObject = false) {
    invariantGuard(typeName)
    if (this.onMissingTypeFns.length) {
      for (let i = 0; i < this.onMissingTypeFns.length; i++) {
        const fn = this.onMissingTypeFns[i]
        const replacementType = fn(typeName, this.builderLens)
        if (replacementType && replacementType.name) {
          this.addType(replacementType)
          return this.getOrBuildType(replacementType)
        }
      }
    }
    if (typeName === 'Query') {
      return new graphql_1.GraphQLObjectType({
        name: 'Query',
        fields: {
          ok: {
            type: graphql_1.GraphQLNonNull(graphql_1.GraphQLBoolean),
            resolve: () => true,
          },
        },
      })
    }
    if (!this.missingTypes[typeName]) {
      this.missingTypes[typeName] = { fromObject }
    }
    return utils_1.UNKNOWN_TYPE_SCALAR
  }
  buildUnionMembers(unionName, members) {
    const unionMembers = []
    /* istanbul ignore next */
    if (!members) {
      throw new Error(
        `Missing Union members for ${unionName}.` +
          `Make sure to call the t.members(...) method in the union blocks`
      )
    }
    members.forEach((member) => {
      unionMembers.push(this.getObjectType(member))
    })
    /* istanbul ignore next */
    if (!unionMembers.length) {
      throw new Error(`GraphQL Nexus: Union ${unionName} must have at least one member type`)
    }
    return unionMembers
  }
  buildOutputFields(fields, typeConfig, intoObject) {
    fields.forEach((field) => {
      intoObject[field.name] = this.buildOutputField(field, typeConfig)
    })
    return intoObject
  }
  buildInputObjectFields(fields, typeConfig) {
    const fieldMap = {}
    fields.forEach((field) => {
      fieldMap[field.name] = this.buildInputObjectField(field, typeConfig)
    })
    return fieldMap
  }
  buildOutputField(fieldConfig, typeConfig) {
    if (!fieldConfig.type) {
      /* istanbul ignore next */
      throw new Error(`Missing required "type" field for ${typeConfig.name}.${fieldConfig.name}`)
    }
    const fieldExtension = new extensions_1.NexusFieldExtension(fieldConfig)
    const builderFieldConfig = {
      name: fieldConfig.name,
      type: this.decorateType(
        this.getOutputType(fieldConfig.type),
        fieldConfig.list,
        this.outputNonNull(typeConfig, fieldConfig)
      ),
      args: this.buildArgs(fieldConfig.args || {}, typeConfig),
      description: fieldConfig.description,
      deprecationReason: fieldConfig.deprecation,
      extensions: {
        nexus: fieldExtension,
      },
    }
    return Object.assign(
      {
        resolve: this.makeFinalResolver(
          {
            builder: this.builderLens,
            fieldConfig: builderFieldConfig,
            parentTypeConfig: typeConfig,
            schemaConfig: this.config,
            schemaExtension: this.schemaExtension,
          },
          fieldConfig.resolve
        ),
        subscribe: fieldConfig.subscribe,
      },
      builderFieldConfig
    )
  }
  makeFinalResolver(info, resolver) {
    const resolveFn = resolver || graphql_1.defaultFieldResolver
    if (this.onCreateResolverFns.length) {
      const toCompose = this.onCreateResolverFns.map((fn) => fn(info)).filter((f) => f)
      if (toCompose.length) {
        return plugin_1.composeMiddlewareFns(toCompose, resolveFn)
      }
    }
    return resolveFn
  }
  buildInputObjectField(field, typeConfig) {
    return {
      type: this.decorateType(
        this.getInputType(field.type),
        field.list,
        this.inputNonNull(typeConfig, field)
      ),
      defaultValue: field.default,
      description: field.description,
    }
  }
  buildArgs(args, typeConfig) {
    const allArgs = {}
    Object.keys(args).forEach((argName) => {
      const argDef = normalizeArg(args[argName]).value
      allArgs[argName] = {
        type: this.decorateType(
          this.getInputType(argDef.type),
          argDef.list,
          this.inputNonNull(typeConfig, argDef)
        ),
        description: argDef.description,
        defaultValue: argDef.default,
      }
    })
    return allArgs
  }
  inputNonNull(typeDef, field) {
    var _a, _b
    const { nullable, required } = field
    const { name, nonNullDefaults = {} } =
      ((_b = (_a = typeDef.extensions) === null || _a === void 0 ? void 0 : _a.nexus) === null ||
      _b === void 0
        ? void 0
        : _b.config) || {}
    if (typeof nullable !== 'undefined' && typeof required !== 'undefined') {
      throw new Error(`Cannot set both nullable & required on ${name}`)
    }
    if (typeof nullable !== 'undefined') {
      return !nullable
    }
    if (typeof required !== 'undefined') {
      return required
    }
    // Null by default
    return utils_1.firstDefined(nonNullDefaults.input, this.nonNullDefaults.input, false)
  }
  outputNonNull(typeDef, field) {
    var _a, _b, _c
    const { nullable } = field
    const { nonNullDefaults = {} } =
      (_c =
        (_b = (_a = typeDef.extensions) === null || _a === void 0 ? void 0 : _a.nexus) === null ||
        _b === void 0
          ? void 0
          : _b.config) !== null && _c !== void 0
        ? _c
        : {}
    if (typeof nullable !== 'undefined') {
      return !nullable
    }
    // Non-Null by default
    return utils_1.firstDefined(nonNullDefaults.output, this.nonNullDefaults.output, true)
  }
  decorateType(type, list, isNonNull) {
    if (list) {
      type = this.decorateList(type, list)
    }
    return isNonNull ? graphql_1.GraphQLNonNull(type) : type
  }
  decorateList(type, list) {
    let finalType = type
    if (!Array.isArray(list)) {
      return graphql_1.GraphQLList(graphql_1.GraphQLNonNull(type))
    }
    if (Array.isArray(list)) {
      for (let i = 0; i < list.length; i++) {
        const isNull = !list[i]
        if (!isNull) {
          finalType = graphql_1.GraphQLNonNull(finalType)
        }
        finalType = graphql_1.GraphQLList(finalType)
      }
    }
    return finalType
  }
  getInterface(name) {
    const type = this.getOrBuildType(name)
    if (!graphql_1.isInterfaceType(type)) {
      /* istanbul ignore next */
      throw new Error(`Expected ${name} to be an interfaceType, saw ${type.constructor.name}`)
    }
    return type
  }
  getInputType(name) {
    const type = this.getOrBuildType(name)
    if (!graphql_1.isInputObjectType(type) && !graphql_1.isLeafType(type)) {
      /* istanbul ignore next */
      throw new Error(`Expected ${name} to be a possible input type, saw ${type.constructor.name}`)
    }
    return type
  }
  getOutputType(name) {
    const type = this.getOrBuildType(name)
    if (!graphql_1.isOutputType(type)) {
      /* istanbul ignore next */
      throw new Error(`Expected ${name} to be a valid output type, saw ${type.constructor.name}`)
    }
    return type
  }
  getObjectType(name) {
    if (wrapping_1.isNexusNamedTypeDef(name)) {
      return this.getObjectType(name.name)
    }
    const type = this.getOrBuildType(name)
    if (!graphql_1.isObjectType(type)) {
      /* istanbul ignore next */
      throw new Error(`Expected ${name} to be a objectType, saw ${type.constructor.name}`)
    }
    return type
  }
  getOrBuildType(name, fromObject = false) {
    invariantGuard(name)
    if (wrapping_1.isNexusNamedTypeDef(name)) {
      return this.getOrBuildType(name.name, true)
    }
    if (SCALARS[name]) {
      return SCALARS[name]
    }
    if (this.finalTypeMap[name]) {
      return this.finalTypeMap[name]
    }
    if (this.buildingTypes.has(name)) {
      /* istanbul ignore next */
      throw new Error(
        `GraphQL Nexus: Circular dependency detected, while building types ${Array.from(this.buildingTypes)}`
      )
    }
    const pendingType = this.pendingTypeMap[name]
    if (wrapping_1.isNexusNamedTypeDef(pendingType)) {
      this.buildingTypes.add(pendingType.name)
      if (wrapping_1.isNexusObjectTypeDef(pendingType)) {
        return this.buildObjectType(pendingType.value)
      } else if (wrapping_1.isNexusInterfaceTypeDef(pendingType)) {
        return this.buildInterfaceType(pendingType.value)
      } else if (wrapping_1.isNexusEnumTypeDef(pendingType)) {
        return this.buildEnumType(pendingType.value)
      } else if (wrapping_1.isNexusScalarTypeDef(pendingType)) {
        return this.buildScalarType(pendingType.value)
      } else if (wrapping_1.isNexusInputObjectTypeDef(pendingType)) {
        return this.buildInputObjectType(pendingType.value)
      } else if (wrapping_1.isNexusUnionTypeDef(pendingType)) {
        return this.buildUnionType(pendingType.value)
      } else {
        console.warn('Unknown kind of type def to build. It will be ignored. The type def was: %j', name)
      }
    }
    return this.missingType(name, fromObject)
  }
  missingResolveType(name, location) {
    console.error(
      new Error(
        `Missing resolveType for the ${name} ${location}. ` +
          `Be sure to add one in the definition block for the type, ` +
          `or t.resolveType(() => null) if you don't want or need to implement.`
      )
    )
    return (obj) => (obj === null || obj === void 0 ? void 0 : obj.__typename) || null
  }
  walkInputType(obj) {
    const definitionBlock = new definitionBlocks_1.InputDefinitionBlock({
      typeName: obj.name,
      addField: (f) => this.maybeTraverseInputFieldType(f),
      addDynamicInputFields: (block, isList) => this.addDynamicInputFields(block, isList),
      warn: () => {},
    })
    obj.definition(definitionBlock)
    return obj
  }
  addDynamicInputFields(block, isList) {
    utils_1.eachObj(this.dynamicInputFields, (val, methodName) => {
      if (typeof val === 'string') {
        return this.addDynamicScalar(methodName, val, block)
      }
      // @ts-ignore
      block[methodName] = (...args) => {
        const config = isList ? [args[0], Object.assign({ list: isList }, args[1])] : args
        return val.value.factory({
          args: config,
          typeDef: block,
          builder: this.builderLens,
          typeName: block.typeName,
        })
      }
    })
  }
  addDynamicOutputMembers(block, isList, stage) {
    utils_1.eachObj(this.dynamicOutputFields, (val, methodName) => {
      if (typeof val === 'string') {
        return this.addDynamicScalar(methodName, val, block)
      }
      // @ts-ignore
      block[methodName] = (...args) => {
        const config = isList ? [args[0], Object.assign({ list: isList }, args[1])] : args
        return val.value.factory({
          args: config,
          typeDef: block,
          builder: this.builderLens,
          typeName: block.typeName,
          stage,
        })
      }
    })
    utils_1.eachObj(this.dynamicOutputProperties, (val, propertyName) => {
      Object.defineProperty(block, propertyName, {
        get() {
          return val.value.factory({
            typeDef: block,
            builder: this.builderLens,
            typeName: block.typeName,
            stage,
          })
        },
        enumerable: true,
      })
    })
  }
  addDynamicScalar(methodName, typeName, block) {
    // @ts-ignore
    block[methodName] = (fieldName, opts) => {
      let fieldConfig = {
        type: typeName,
      }
      if (typeof opts === 'function') {
        // @ts-ignore
        fieldConfig.resolve = opts
      } else {
        fieldConfig = Object.assign(Object.assign({}, fieldConfig), opts)
      }
      // @ts-ignore
      block.field(fieldName, fieldConfig)
    }
  }
  walkOutputType(obj) {
    const definitionBlock = new objectType_1.ObjectDefinitionBlock({
      typeName: obj.name,
      addInterfaces: (i) => {
        i.forEach((j) => {
          if (typeof j !== 'string') {
            this.addType(j)
          }
        })
      },
      addField: (f) => this.maybeTraverseOutputFieldType(f),
      addDynamicOutputMembers: (block, isList) => this.addDynamicOutputMembers(block, isList, 'walk'),
      warn: () => {},
    })
    obj.definition(definitionBlock)
    return obj
  }
  walkInterfaceType(obj) {
    const definitionBlock = new interfaceType_1.InterfaceDefinitionBlock({
      typeName: obj.name,
      setResolveType: () => {},
      addField: (f) => this.maybeTraverseOutputFieldType(f),
      addDynamicOutputMembers: (block, isList) => this.addDynamicOutputMembers(block, isList, 'walk'),
      warn: () => {},
    })
    obj.definition(definitionBlock)
    return obj
  }
  maybeTraverseOutputFieldType(type) {
    const { args, type: fieldType } = type
    if (typeof fieldType !== 'string') {
      this.addType(fieldType)
    }
    if (args) {
      utils_1.eachObj(args, (val) => {
        const t = wrapping_1.isNexusArgDef(val) ? val.value.type : val
        if (typeof t !== 'string') {
          this.addType(t)
        }
      })
    }
  }
  maybeTraverseInputFieldType(type) {
    const { type: fieldType } = type
    if (typeof fieldType !== 'string') {
      this.addType(fieldType)
    }
  }
  walkNamedTypes(namedType) {
    if (graphql_1.isObjectType(namedType) || graphql_1.isInterfaceType(namedType)) {
      utils_1.eachObj(namedType.getFields(), (val) => this.addNamedTypeOutputField(val))
    }
    if (graphql_1.isObjectType(namedType)) {
      namedType.getInterfaces().forEach((i) => this.addUnknownTypeInternal(i))
    }
    if (graphql_1.isInputObjectType(namedType)) {
      utils_1.eachObj(namedType.getFields(), (val) =>
        this.addUnknownTypeInternal(graphql_1.getNamedType(val.type))
      )
    }
    if (graphql_1.isUnionType(namedType)) {
      namedType.getTypes().forEach((type) => this.addUnknownTypeInternal(type))
    }
  }
  addUnknownTypeInternal(t) {
    if (!this.definedTypeMap[t.name]) {
      this.addType(t)
    }
  }
  addNamedTypeOutputField(obj) {
    this.addUnknownTypeInternal(graphql_1.getNamedType(obj.type))
    if (obj.args) {
      obj.args.forEach((val) => this.addType(graphql_1.getNamedType(val.type)))
    }
  }
  replaceNamedType(type) {
    let wrappingTypes = []
    let finalType = type
    while (graphql_1.isWrappingType(finalType)) {
      wrappingTypes.unshift(finalType.constructor)
      finalType = finalType.ofType
    }
    if (this.finalTypeMap[finalType.name] === this.definedTypeMap[finalType.name]) {
      return type
    }
    return wrappingTypes.reduce((result, Wrapper) => {
      return new Wrapper(result)
    }, this.finalTypeMap[finalType.name])
  }
}
exports.SchemaBuilder = SchemaBuilder
function extendError(name) {
  return new Error(`${name} was already defined and imported as a type, check the docs for extending types`)
}
/**
 * Builds the schema, we may return more than just the schema
 * from this one day.
 */
function makeSchemaInternal(config) {
  const builder = new SchemaBuilder(config)
  builder.addTypes(config.types)
  const { finalConfig, typeMap, missingTypes, schemaExtension, onAfterBuildFns } = builder.getFinalTypeMap()
  const { Query, Mutation, Subscription } = typeMap
  /* istanbul ignore next */
  if (!graphql_1.isObjectType(Query)) {
    throw new Error(`Expected Query to be a objectType, saw ${Query.constructor.name}`)
  }
  /* istanbul ignore next */
  if (Mutation && !graphql_1.isObjectType(Mutation)) {
    throw new Error(`Expected Mutation to be a objectType, saw ${Mutation.constructor.name}`)
  }
  /* istanbul ignore next */
  if (Subscription && !graphql_1.isObjectType(Subscription)) {
    throw new Error(`Expected Subscription to be a objectType, saw ${Subscription.constructor.name}`)
  }
  const schema = new graphql_1.GraphQLSchema({
    query: Query,
    mutation: Mutation,
    subscription: Subscription,
    types: utils_1.objValues(typeMap),
    extensions: {
      nexus: schemaExtension,
    },
  })
  onAfterBuildFns.forEach((fn) => fn(schema))
  return { schema, missingTypes, finalConfig }
}
exports.makeSchemaInternal = makeSchemaInternal
/**
 * Defines the GraphQL schema, by combining the GraphQL types defined
 * by the GraphQL Nexus layer or any manually defined GraphQLType objects.
 *
 * Requires at least one type be named "Query", which will be used as the
 * root query type.
 */
function makeSchema(config) {
  const { schema, missingTypes, finalConfig } = makeSchemaInternal(config)
  const typegenConfig = typegenUtils_1.resolveTypegenConfig(finalConfig)
  if (typegenConfig.outputs.schema || typegenConfig.outputs.typegen) {
    // Generating in the next tick allows us to use the schema
    // in the optional thunk for the typegen config
    const typegenPromise = new typegenMetadata_1.TypegenMetadata(typegenConfig).generateArtifacts(schema)
    if (config.shouldExitAfterGenerateArtifacts) {
      typegenPromise
        .then(() => {
          console.log(`Generated Artifacts:
          TypeScript Types  ==> ${typegenConfig.outputs.typegen || '(not enabled)'}
          GraphQL Schema    ==> ${typegenConfig.outputs.schema || '(not enabled)'}`)
          process.exit(0)
        })
        .catch((e) => {
          console.error(e)
          process.exit(1)
        })
    } else {
      typegenPromise.catch((e) => {
        console.error(e)
      })
    }
  }
  utils_1.assertNoMissingTypes(schema, missingTypes)
  return schema
}
exports.makeSchema = makeSchema
/**
 * Like makeSchema except that typegen is always run
 * and waited upon.
 */
function generateSchema(config) {
  return tslib_1.__awaiter(this, void 0, void 0, function* () {
    const { schema, missingTypes, finalConfig } = makeSchemaInternal(config)
    const typegenConfig = typegenUtils_1.resolveTypegenConfig(finalConfig)
    utils_1.assertNoMissingTypes(schema, missingTypes)
    yield new typegenMetadata_1.TypegenMetadata(typegenConfig).generateArtifacts(schema)
    return schema
  })
}
exports.generateSchema = generateSchema
/**
 * Mainly useful for testing, generates the schema and returns the artifacts
 * that would have been otherwise written to the filesystem.
 */
generateSchema.withArtifacts = (config, typeFilePath) =>
  tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const { schema, missingTypes, finalConfig } = makeSchemaInternal(config)
    const typegenConfig = typegenUtils_1.resolveTypegenConfig(finalConfig)
    utils_1.assertNoMissingTypes(schema, missingTypes)
    const { schemaTypes, tsTypes } = yield new typegenMetadata_1.TypegenMetadata(
      typegenConfig
    ).generateArtifactContents(schema, typeFilePath)
    return { schema, schemaTypes, tsTypes }
  })
/**
 * Assertion utility with nexus-aware feedback for users.
 */
function invariantGuard(val) {
  /* istanbul ignore next */
  if (Boolean(val) === false) {
    throw new Error(
      'Nexus Error: This should never happen, ' +
        'please check your code or if you think this is a bug open a GitHub issue https://github.com/prisma-labs/nexus/issues/new.'
    )
  }
}
function normalizeArg(argVal) {
  if (wrapping_1.isNexusArgDef(argVal)) {
    return argVal
  }
  return args_1.arg({ type: argVal })
}
//# sourceMappingURL=builder.js.map
