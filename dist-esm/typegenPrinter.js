import { __rest } from 'tslib'
import {
  isEnumType,
  isInputObjectType,
  isInterfaceType,
  isListType,
  isNonNullType,
  isObjectType,
  isScalarType,
  isSpecifiedScalarType,
  isUnionType,
} from 'graphql'
import path from 'path'
import { isNexusPrintedGenTyping, isNexusPrintedGenTypingImport } from './definitions/wrapping'
import { eachObj, getOwnPackage, groupTypes, mapObj, relativePathTo } from './utils'
const SpecifiedScalars = {
  ID: 'string',
  String: 'string',
  Float: 'number',
  Int: 'number',
  Boolean: 'boolean',
}
/**
 * We track and output a few main things:
 *
 * 1. "root" types, or the values that fill the first
 *    argument for a given object type
 *
 * 2. "arg" types, the values that are arguments to output fields.
 *
 * 3. "return" types, the values returned from the resolvers... usually
 *    just list/nullable variations on the "root" types for other types
 *
 * 4. The names of all types, grouped by type.
 *
 * - Non-scalar types will get a dedicated "Root" type associated with it
 */
export class TypegenPrinter {
  constructor(schema, typegenInfo) {
    this.schema = schema
    this.typegenInfo = typegenInfo
    this.printObj = (space, source) => (val, key) => {
      return [`${space}${key}: { // ${source}`]
        .concat(
          mapObj(val, (v2, k2) => {
            return `${space}  ${k2}${v2[0]} ${v2[1]}`
          })
        )
        .concat(`${space}}`)
        .join('\n')
    }
    this.groupedTypes = groupTypes(schema)
    this.printImports = {}
  }
  print() {
    const body = [
      this.printInputTypeMap(),
      this.printEnumTypeMap(),
      this.printScalarTypeMap(),
      this.printRootTypeMap(),
      this.printAllTypesMap(),
      this.printReturnTypeMap(),
      this.printArgTypeMap(),
      this.printAbstractResolveReturnTypeMap(),
      this.printInheritedFieldMap(),
      this.printTypeNames('object', 'NexusGenObjectNames'),
      this.printTypeNames('input', 'NexusGenInputNames'),
      this.printTypeNames('enum', 'NexusGenEnumNames'),
      this.printTypeNames('interface', 'NexusGenInterfaceNames'),
      this.printTypeNames('scalar', 'NexusGenScalarNames'),
      this.printTypeNames('union', 'NexusGenUnionNames'),
      this.printGenTypeMap(),
      this.printPlugins(),
    ].join('\n\n')
    return [this.printHeaders(), body].join('\n\n')
  }
  printHeaders() {
    const fieldDefs = [
      this.printDynamicInputFieldDefinitions(),
      this.printDynamicOutputFieldDefinitions(),
      this.printDynamicOutputPropertyDefinitions(),
    ]
    return [
      this.typegenInfo.headers.join('\n'),
      this.typegenInfo.imports.join('\n'),
      this.printDynamicImport(),
      ...fieldDefs,
      GLOBAL_DECLARATION,
    ].join('\n')
  }
  printGenTypeMap() {
    return [`export interface NexusGenTypes {`]
      .concat([
        `  context: ${this.printContext()};`,
        `  inputTypes: NexusGenInputs;`,
        `  rootTypes: NexusGenRootTypes;`,
        `  argTypes: NexusGenArgTypes;`,
        `  fieldTypes: NexusGenFieldTypes;`,
        `  allTypes: NexusGenAllTypes;`,
        `  inheritedFields: NexusGenInheritedFields;`,
        `  objectNames: NexusGenObjectNames;`,
        `  inputNames: NexusGenInputNames;`,
        `  enumNames: NexusGenEnumNames;`,
        `  interfaceNames: NexusGenInterfaceNames;`,
        `  scalarNames: NexusGenScalarNames;`,
        `  unionNames: NexusGenUnionNames;`,
        `  allInputTypes: NexusGenTypes['inputNames'] | NexusGenTypes['enumNames'] | NexusGenTypes['scalarNames'];`,
        `  allOutputTypes: NexusGenTypes['objectNames'] | NexusGenTypes['enumNames'] | NexusGenTypes['unionNames'] | NexusGenTypes['interfaceNames'] | NexusGenTypes['scalarNames'];`,
        `  allNamedTypes: NexusGenTypes['allInputTypes'] | NexusGenTypes['allOutputTypes']`,
        `  abstractTypes: NexusGenTypes['interfaceNames'] | NexusGenTypes['unionNames'];`,
        `  abstractResolveReturn: NexusGenAbstractResolveReturnTypes;`,
      ])
      .concat('}')
      .join('\n')
  }
  printDynamicImport() {
    var _a
    const {
      rootTypings,
      dynamicFields: { dynamicInputFields, dynamicOutputFields },
    } = this.schema.extensions.nexus.config
    const imports = []
    const importMap = {}
    const outputPath = this.typegenInfo.typegenFile
    const nexusSchemaImportId =
      (_a = this.typegenInfo.nexusSchemaImportId) !== null && _a !== void 0 ? _a : getOwnPackage().name
    if (!this.printImports[nexusSchemaImportId]) {
      if ([dynamicInputFields, dynamicOutputFields].some((o) => Object.keys(o).length > 0)) {
        this.printImports[nexusSchemaImportId] = {
          core: true,
        }
      }
    }
    eachObj(rootTypings, (val, key) => {
      if (typeof val !== 'string') {
        const importPath = (path.isAbsolute(val.path) ? relativePathTo(val.path, outputPath) : val.path)
          .replace(/(\.d)?\.ts/, '')
          .replace(/\\+/g, '/')
        importMap[importPath] = importMap[importPath] || new Set()
        importMap[importPath].add(val.alias ? `${val.name} as ${val.alias}` : val.name)
      }
    })
    eachObj(importMap, (val, key) => {
      imports.push(`import { ${Array.from(val).join(', ')} } from ${JSON.stringify(key)}`)
    })
    eachObj(this.printImports, (val, key) => {
      const { default: def } = val,
        rest = __rest(val, ['default'])
      const idents = []
      if (def) {
        idents.push(def)
      }
      let bindings = []
      eachObj(rest, (alias, binding) => {
        bindings.push(alias !== true ? `${binding} as ${alias}` : `${binding}`)
      })
      if (bindings.length) {
        idents.push(`{ ${bindings.join(', ')} }`)
      }
      imports.push(`import ${idents.join(', ')} from ${JSON.stringify(key)}`)
    })
    return imports.join('\n')
  }
  printDynamicInputFieldDefinitions() {
    const { dynamicInputFields } = this.schema.extensions.nexus.config.dynamicFields
    // If there is nothing custom... exit
    if (!Object.keys(dynamicInputFields).length) {
      return []
    }
    return [`declare global {`, `  interface NexusGenCustomInputMethods<TypeName extends string> {`]
      .concat(
        mapObj(dynamicInputFields, (val, key) => {
          if (typeof val === 'string') {
            return `    ${key}<FieldName extends string>(fieldName: FieldName, opts?: core.ScalarInputFieldConfig<core.GetGen3<"inputTypes", TypeName, FieldName>>): void // ${JSON.stringify(
              val
            )};`
          }
          return `    ${key}${val.value.typeDefinition || `(...args: any): void`}`
        })
      )
      .concat([`  }`, `}`])
      .join('\n')
  }
  printDynamicOutputFieldDefinitions() {
    const { dynamicOutputFields } = this.schema.extensions.nexus.config.dynamicFields
    // If there is nothing custom... exit
    if (!Object.keys(dynamicOutputFields).length) {
      return []
    }
    return [`declare global {`, `  interface NexusGenCustomOutputMethods<TypeName extends string> {`]
      .concat(
        mapObj(dynamicOutputFields, (val, key) => {
          if (typeof val === 'string') {
            return `    ${key}<FieldName extends string>(fieldName: FieldName, ...opts: core.ScalarOutSpread<TypeName, FieldName>): void // ${JSON.stringify(
              val
            )};`
          }
          return `    ${key}${val.value.typeDefinition || `(...args: any): void`}`
        })
      )
      .concat([`  }`, `}`])
      .join('\n')
  }
  printDynamicOutputPropertyDefinitions() {
    const { dynamicOutputProperties } = this.schema.extensions.nexus.config.dynamicFields
    // If there is nothing custom... exit
    if (!Object.keys(dynamicOutputProperties).length) {
      return []
    }
    return [`declare global {`, `  interface NexusGenCustomOutputProperties<TypeName extends string> {`]
      .concat(
        mapObj(dynamicOutputProperties, (val, key) => {
          return `    ${key}${val.value.typeDefinition || `: any`}`
        })
      )
      .concat([`  }`, `}`])
      .join('\n')
  }
  printInheritedFieldMap() {
    // TODO:
    return 'export interface NexusGenInheritedFields {}'
  }
  printContext() {
    return this.typegenInfo.contextType || '{}'
  }
  buildResolveSourceTypeMap() {
    const sourceMap = {}
    const abstractTypes = []
    abstractTypes
      .concat(this.groupedTypes.union)
      .concat(this.groupedTypes.interface)
      .forEach((type) => {
        if (isInterfaceType(type)) {
          const possibleNames = this.schema.getPossibleTypes(type).map((t) => t.name)
          if (possibleNames.length > 0) {
            sourceMap[type.name] = possibleNames.map((val) => `NexusGenRootTypes['${val}']`).join(' | ')
          }
        } else {
          sourceMap[type.name] = type
            .getTypes()
            .map((t) => `NexusGenRootTypes['${t.name}']`)
            .join(' | ')
        }
      })
    return sourceMap
  }
  printAbstractResolveReturnTypeMap() {
    return this.printTypeInterface('NexusGenAbstractResolveReturnTypes', this.buildResolveReturnTypesMap())
  }
  buildResolveReturnTypesMap() {
    const sourceMap = {}
    const abstractTypes = []
    abstractTypes
      .concat(this.groupedTypes.union)
      .concat(this.groupedTypes.interface)
      .forEach((type) => {
        if (isInterfaceType(type)) {
          const possibleNames = this.schema.getPossibleTypes(type).map((t) => t.name)
          if (possibleNames.length > 0) {
            sourceMap[type.name] = possibleNames.map((val) => JSON.stringify(val)).join(' | ')
          }
        } else {
          sourceMap[type.name] = type
            .getTypes()
            .map((t) => JSON.stringify(t.name))
            .join(' | ')
        }
      })
    return sourceMap
  }
  printTypeNames(name, exportName) {
    const obj = this.groupedTypes[name]
    const typeDef =
      obj.length === 0
        ? 'never'
        : obj
            .map((o) => JSON.stringify(o.name))
            .sort()
            .join(' | ')
    return `export type ${exportName} = ${typeDef};`
  }
  buildEnumTypeMap() {
    const enumMap = {}
    this.groupedTypes.enum.forEach((e) => {
      const backingType = this.resolveBackingType(e.name)
      if (backingType) {
        enumMap[e.name] = backingType
      } else {
        const values = e.getValues().map((val) => JSON.stringify(val.value))
        enumMap[e.name] = values.join(' | ')
      }
    })
    return enumMap
  }
  buildInputTypeMap() {
    const inputObjMap = {}
    this.groupedTypes.input.forEach((input) => {
      eachObj(input.getFields(), (field) => {
        inputObjMap[input.name] = inputObjMap[input.name] || {}
        inputObjMap[input.name][field.name] = this.normalizeArg(field)
      })
    })
    return inputObjMap
  }
  buildScalarTypeMap() {
    const scalarMap = {}
    this.groupedTypes.scalar.forEach((e) => {
      if (isSpecifiedScalarType(e)) {
        scalarMap[e.name] = SpecifiedScalars[e.name]
        return
      }
      const backingType = this.resolveBackingType(e.name)
      if (backingType) {
        scalarMap[e.name] = backingType
      } else {
        scalarMap[e.name] = 'any'
      }
    })
    return scalarMap
  }
  printInputTypeMap() {
    return this.printTypeFieldInterface('NexusGenInputs', this.buildInputTypeMap(), 'input type')
  }
  printEnumTypeMap() {
    return this.printTypeInterface('NexusGenEnums', this.buildEnumTypeMap())
  }
  printScalarTypeMap() {
    return this.printTypeInterface('NexusGenScalars', this.buildScalarTypeMap())
  }
  buildRootTypeMap() {
    const rootTypeMap = {}
    const hasFields = []
    hasFields
      .concat(this.groupedTypes.object)
      .concat(this.groupedTypes.interface)
      .concat(this.groupedTypes.union)
      .forEach((type) => {
        const rootTyping = this.resolveBackingType(type.name)
        if (rootTyping) {
          rootTypeMap[type.name] = rootTyping
          return
        }
        if (isUnionType(type)) {
          rootTypeMap[type.name] = type
            .getTypes()
            .map((t) => `NexusGenRootTypes['${t.name}']`)
            .join(' | ')
        } else if (isInterfaceType(type)) {
          const possibleRoots = this.schema
            .getPossibleTypes(type)
            .map((t) => `NexusGenRootTypes['${t.name}']`)
          if (possibleRoots.length > 0) {
            rootTypeMap[type.name] = possibleRoots.join(' | ')
          } else {
            rootTypeMap[type.name] = 'any'
          }
        } else if (type.name === 'Query' || type.name === 'Mutation') {
          rootTypeMap[type.name] = '{}'
        } else {
          eachObj(type.getFields(), (field) => {
            const obj = (rootTypeMap[type.name] = rootTypeMap[type.name] || {})
            if (!this.hasResolver(field, type)) {
              if (typeof obj !== 'string') {
                obj[field.name] = [this.argSeparator(field.type), this.printOutputType(field.type)]
              }
            }
          })
        }
      })
    return rootTypeMap
  }
  resolveBackingType(typeName) {
    const rootTyping = this.schema.extensions.nexus.config.rootTypings[typeName]
    if (rootTyping) {
      return typeof rootTyping === 'string' ? rootTyping : rootTyping.name
    }
    return this.typegenInfo.backingTypeMap[typeName]
  }
  buildAllTypesMap() {
    const typeMap = {}
    const toCheck = []
    toCheck
      .concat(this.groupedTypes.input)
      .concat(this.groupedTypes.enum)
      .concat(this.groupedTypes.scalar)
      .forEach((type) => {
        if (isInputObjectType(type)) {
          typeMap[type.name] = `NexusGenInputs['${type.name}']`
        } else if (isEnumType(type)) {
          typeMap[type.name] = `NexusGenEnums['${type.name}']`
        } else if (isScalarType(type)) {
          typeMap[type.name] = `NexusGenScalars['${type.name}']`
        }
      })
    return typeMap
  }
  hasResolver(
    field,
    // Used in test mocking
    _type
  ) {
    if (field.extensions && field.extensions.nexus) {
      return field.extensions.nexus.hasDefinedResolver
    }
    return Boolean(field.resolve)
  }
  printRootTypeMap() {
    return this.printRootTypeFieldInterface('NexusGenRootTypes', this.buildRootTypeMap())
  }
  printAllTypesMap() {
    const typeMapping = this.buildAllTypesMap()
    return [`export interface NexusGenAllTypes extends NexusGenRootTypes {`]
      .concat(
        mapObj(typeMapping, (val, key) => {
          return `  ${key}: ${val};`
        })
      )
      .concat('}')
      .join('\n')
  }
  buildArgTypeMap() {
    const argTypeMap = {}
    const hasFields = []
    hasFields
      .concat(this.groupedTypes.object)
      .concat(this.groupedTypes.interface)
      .forEach((type) => {
        eachObj(type.getFields(), (field) => {
          if (field.args.length > 0) {
            argTypeMap[type.name] = argTypeMap[type.name] || {}
            argTypeMap[type.name][field.name] = field.args.reduce((obj, arg) => {
              obj[arg.name] = this.normalizeArg(arg)
              return obj
            }, {})
          }
        })
      })
    return argTypeMap
  }
  printArgTypeMap() {
    return this.printArgTypeFieldInterface(this.buildArgTypeMap())
  }
  buildReturnTypeMap() {
    const returnTypeMap = {}
    const hasFields = []
    hasFields
      .concat(this.groupedTypes.object)
      .concat(this.groupedTypes.interface)
      .forEach((type) => {
        eachObj(type.getFields(), (field) => {
          returnTypeMap[type.name] = returnTypeMap[type.name] || {}
          returnTypeMap[type.name][field.name] = [':', this.printOutputType(field.type)]
        })
      })
    return returnTypeMap
  }
  printOutputType(type) {
    const returnType = this.typeToArr(type)
    function combine(item) {
      if (item.length === 1) {
        if (Array.isArray(item[0])) {
          const toPrint = combine(item[0])
          return toPrint.indexOf('null') === -1 ? `${toPrint}[]` : `Array<${toPrint}>`
        }
        return item[0]
      }
      if (Array.isArray(item[1])) {
        const toPrint = combine(item[1])
        return toPrint.indexOf('null') === -1 ? `${toPrint}[] | null` : `Array<${toPrint}> | null`
      }
      return `${item[1]} | null`
    }
    return `${combine(returnType)}; // ${type}`
  }
  typeToArr(type) {
    const typing = []
    if (isNonNullType(type)) {
      type = type.ofType
    } else {
      typing.push(null)
    }
    if (isListType(type)) {
      typing.push(this.typeToArr(type.ofType))
    } else if (isScalarType(type)) {
      typing.push(this.printScalar(type))
    } else if (isEnumType(type)) {
      typing.push(`NexusGenEnums['${type.name}']`)
    } else if (isObjectType(type) || isInterfaceType(type) || isUnionType(type)) {
      typing.push(`NexusGenRootTypes['${type.name}']`)
    }
    return typing
  }
  printReturnTypeMap() {
    return this.printTypeFieldInterface('NexusGenFieldTypes', this.buildReturnTypeMap(), 'field return type')
  }
  normalizeArg(arg) {
    return [this.argSeparator(arg.type), this.argTypeRepresentation(arg.type)]
  }
  argSeparator(type) {
    if (isNonNullType(type)) {
      return ':'
    }
    return '?:'
  }
  argTypeRepresentation(arg) {
    const argType = this.argTypeArr(arg)
    function combine(item) {
      if (item.length === 1) {
        if (Array.isArray(item[0])) {
          const toPrint = combine(item[0])
          return toPrint.indexOf('null') === -1 ? `${toPrint}[]` : `Array<${toPrint}>`
        }
        return item[0]
      }
      if (Array.isArray(item[1])) {
        const toPrint = combine(item[1])
        return toPrint.indexOf('null') === -1 ? `${toPrint}[] | null` : `Array<${toPrint}> | null`
      }
      return `${item[1]} | null`
    }
    return `${combine(argType)}; // ${arg}`
  }
  argTypeArr(arg) {
    const typing = []
    if (isNonNullType(arg)) {
      arg = arg.ofType
    } else {
      typing.push(null)
    }
    if (isListType(arg)) {
      typing.push(this.argTypeArr(arg.ofType))
    } else if (isScalarType(arg)) {
      typing.push(this.printScalar(arg))
    } else if (isEnumType(arg)) {
      typing.push(`NexusGenEnums['${arg.name}']`)
    } else if (isInputObjectType(arg)) {
      typing.push(`NexusGenInputs['${arg.name}']`)
    }
    return typing
  }
  printTypeInterface(interfaceName, typeMapping) {
    return [`export interface ${interfaceName} {`]
      .concat(mapObj(typeMapping, (val, key) => `  ${key}: ${val}`))
      .concat('}')
      .join('\n')
  }
  printRootTypeFieldInterface(interfaceName, typeMapping) {
    return [`export interface ${interfaceName} {`]
      .concat(
        mapObj(typeMapping, (val, key) => {
          if (typeof val === 'string') {
            return `  ${key}: ${val};`
          }
          if (Object.keys(val).length === 0) {
            return `  ${key}: {};`
          }
          return this.printObj('  ', 'root type')(val, key)
        })
      )
      .concat('}')
      .join('\n')
  }
  printTypeFieldInterface(interfaceName, typeMapping, source) {
    return [`export interface ${interfaceName} {`]
      .concat(mapObj(typeMapping, this.printObj('  ', source)))
      .concat('}')
      .join('\n')
  }
  printArgTypeFieldInterface(typeMapping) {
    return [`export interface NexusGenArgTypes {`]
      .concat(
        mapObj(typeMapping, (val, key) => {
          return [`  ${key}: {`]
            .concat(mapObj(val, this.printObj('    ', 'args')))
            .concat('  }')
            .join('\n')
        })
      )
      .concat('}')
      .join('\n')
  }
  printScalar(type) {
    if (isSpecifiedScalarType(type)) {
      return SpecifiedScalars[type.name]
    }
    return `NexusGenScalars['${type.name}']`
  }
  printPlugins() {
    const pluginFieldExt = [
      `  interface NexusGenPluginFieldConfig<TypeName extends string, FieldName extends string> {`,
    ]
    const pluginSchemaExt = [`  interface NexusGenPluginSchemaConfig {`]
    const pluginTypeExt = [`  interface NexusGenPluginTypeConfig<TypeName extends string> {`]
    const printInlineDefs = []
    const plugins = this.schema.extensions.nexus.config.plugins || []
    plugins.forEach((plugin) => {
      if (plugin.config.fieldDefTypes) {
        pluginFieldExt.push(padLeft(this.printType(plugin.config.fieldDefTypes), '    '))
      }
      if (plugin.config.objectTypeDefTypes) {
        pluginTypeExt.push(padLeft(this.printType(plugin.config.objectTypeDefTypes), '    '))
      }
    })
    return [
      printInlineDefs.join('\n'),
      [
        'declare global {',
        [
          pluginTypeExt.concat('  }').join('\n'),
          pluginFieldExt.concat('  }').join('\n'),
          pluginSchemaExt.concat('  }').join('\n'),
        ].join('\n'),
        '}',
      ].join('\n'),
    ].join('\n')
  }
  printType(strLike) {
    if (Array.isArray(strLike)) {
      return strLike.map((s) => this.printType(s)).join('\n')
    }
    if (isNexusPrintedGenTyping(strLike)) {
      strLike.imports.forEach((i) => {
        this.addImport(i)
      })
      return strLike.toString()
    }
    if (isNexusPrintedGenTypingImport(strLike)) {
      this.addImport(strLike)
      return ''
    }
    return strLike
  }
  addImport(i) {
    /* istanbul ignore if */
    if (!isNexusPrintedGenTypingImport(i)) {
      console.warn(`Expected printedGenTypingImport, saw ${i}`)
      return
    }
    this.printImports[i.config.module] = this.printImports[i.config.module] || {}
    if (i.config.default) {
      this.printImports[i.config.module].default = i.config.default
    }
    if (i.config.bindings) {
      i.config.bindings.forEach((binding) => {
        if (typeof binding === 'string') {
          this.printImports[i.config.module][binding] = true
        } else {
          this.printImports[i.config.module][binding[0]] = binding[1]
        }
      })
    }
  }
}
function padLeft(str, padding) {
  return str
    .split('\n')
    .map((s) => `${padding}${s}`)
    .join('\n')
}
const GLOBAL_DECLARATION = `
declare global {
  interface NexusGen extends NexusGenTypes {}
}`
//# sourceMappingURL=typegenPrinter.js.map
