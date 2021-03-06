'use strict'
Object.defineProperty(exports, '__esModule', { value: true })
exports.makeResolveFn = exports.connectionPlugin = void 0
const tslib_1 = require('tslib')
const args_1 = require('../definitions/args')
const objectType_1 = require('../definitions/objectType')
const dynamicMethod_1 = require('../dynamicMethod')
const plugin_1 = require('../plugin')
const utils_1 = require('../utils')
const ForwardPaginateArgs = {
  first: args_1.intArg({
    nullable: true,
    description: 'Returns the first n elements from the list.',
  }),
  after: args_1.stringArg({
    nullable: true,
    description: 'Returns the elements in the list that come after the specified cursor',
  }),
}
const ForwardOnlyStrictArgs = Object.assign(Object.assign({}, ForwardPaginateArgs), {
  first: args_1.intArg({
    nullable: false,
    description: 'Returns the first n elements from the list.',
  }),
})
const BackwardPaginateArgs = {
  last: args_1.intArg({
    nullable: true,
    description: 'Returns the last n elements from the list.',
  }),
  before: args_1.stringArg({
    nullable: true,
    description: 'Returns the elements in the list that come before the specified cursor',
  }),
}
const BackwardOnlyStrictArgs = Object.assign(Object.assign({}, BackwardPaginateArgs), {
  last: args_1.intArg({
    nullable: false,
    description: 'Returns the last n elements from the list.',
  }),
})
function base64Encode(str) {
  return Buffer.from(str, 'utf8').toString('base64')
}
function base64Decode(str) {
  return Buffer.from(str, 'base64').toString('utf8')
}
exports.connectionPlugin = (connectionPluginConfig) => {
  var _a
  const pluginConfig = Object.assign({}, connectionPluginConfig)
  // Define the plugin with the appropriate configuration.
  return plugin_1.plugin({
    name: 'ConnectionPlugin',
    fieldDefTypes: [
      utils_1.printedGenTypingImport({
        module:
          (_a =
            connectionPluginConfig === null || connectionPluginConfig === void 0
              ? void 0
              : connectionPluginConfig.nexusSchemaImportId) !== null && _a !== void 0
            ? _a
            : utils_1.getOwnPackage().name,
        bindings: ['core', 'connectionPluginCore'],
      }),
    ],
    // Defines the field added to the definition block:
    // t.connectionField('users', {
    //   type: User
    // })
    onInstall(b) {
      let dynamicConfig = []
      const {
        additionalArgs = {},
        extendConnection: pluginExtendConnection,
        extendEdge: pluginExtendEdge,
        includeNodesField = false,
        nexusFieldName = 'connectionField',
      } = pluginConfig
      // If to add fields to every connection, we require the resolver be defined on the
      // field definition.
      if (pluginExtendConnection) {
        utils_1.eachObj(pluginExtendConnection, (val, key) => {
          dynamicConfig.push(`${key}: core.SubFieldResolver<TypeName, FieldName, "${key}">`)
        })
      }
      if (pluginExtendEdge) {
        const edgeFields = utils_1.mapObj(
          pluginExtendEdge,
          (val, key) => `${key}: connectionPluginCore.EdgeFieldResolver<TypeName, FieldName, "${key}">`
        )
        dynamicConfig.push(`edgeFields: { ${edgeFields.join(', ')} }`)
      }
      let printedDynamicConfig = ''
      if (dynamicConfig.length > 0) {
        printedDynamicConfig = ` & { ${dynamicConfig.join(', ')} }`
      }
      // Add the t.connectionField (or something else if we've changed the name)
      b.addType(
        dynamicMethod_1.dynamicOutputMethod({
          name: nexusFieldName,
          typeDefinition: `<FieldName extends string>(
            fieldName: FieldName, 
            config: connectionPluginCore.ConnectionFieldConfig<TypeName, FieldName> ${printedDynamicConfig}
          ): void`,
          factory({ typeName: parentTypeName, typeDef: t, args: factoryArgs, stage }) {
            const [fieldName, fieldConfig] = factoryArgs
            const targetType = fieldConfig.type
            const { targetTypeName, connectionName, edgeName } = getTypeNames(
              fieldName,
              parentTypeName,
              fieldConfig,
              pluginConfig
            )
            if (stage === 'build') {
              assertCorrectConfig(parentTypeName, fieldName, pluginConfig, fieldConfig)
            }
            // Add the "Connection" type to the schema if it doesn't exist already
            if (!b.hasType(connectionName)) {
              b.addType(
                objectType_1.objectType({
                  name: connectionName,
                  definition(t2) {
                    t2.field('edges', {
                      type: edgeName,
                      description: `https://facebook.github.io/relay/graphql/connections.htm#sec-Edge-Types`,
                      nullable: true,
                      list: [false],
                    })
                    t2.field('pageInfo', {
                      type: 'PageInfo',
                      nullable: false,
                      description: `https://facebook.github.io/relay/graphql/connections.htm#sec-undefined.PageInfo`,
                    })
                    if (includeNodesField) {
                      t2.list.field('nodes', {
                        type: targetType,
                        description: `Flattened list of ${targetTypeName} type`,
                      })
                    }
                    if (pluginExtendConnection) {
                      utils_1.eachObj(pluginExtendConnection, (val, key) => {
                        t2.field(key, val)
                      })
                    }
                    if (fieldConfig.extendConnection instanceof Function) {
                      fieldConfig.extendConnection(t2)
                    }
                  },
                })
              )
            }
            // Add the "Edge" type to the schema if it doesn't exist already
            if (!b.hasType(edgeName)) {
              b.addType(
                objectType_1.objectType({
                  name: edgeName,
                  definition(t2) {
                    t2.string('cursor', {
                      nullable: false,
                      description: 'https://facebook.github.io/relay/graphql/connections.htm#sec-Cursor',
                    })
                    t2.field('node', {
                      type: targetType,
                      description: 'https://facebook.github.io/relay/graphql/connections.htm#sec-Node',
                    })
                    if (pluginExtendEdge) {
                      utils_1.eachObj(pluginExtendEdge, (val, key) => {
                        t2.field(key, val)
                      })
                    }
                    if (fieldConfig.extendEdge instanceof Function) {
                      fieldConfig.extendEdge(t2)
                    }
                  },
                })
              )
            }
            // Add the "PageInfo" type to the schema if it doesn't exist already
            if (!b.hasType('PageInfo')) {
              b.addType(
                objectType_1.objectType({
                  name: 'PageInfo',
                  description:
                    'PageInfo cursor, as defined in https://facebook.github.io/relay/graphql/connections.htm#sec-undefined.PageInfo',
                  definition(t2) {
                    t2.boolean('hasNextPage', {
                      nullable: false,
                      description: `Used to indicate whether more edges exist following the set defined by the clients arguments.`,
                    })
                    t2.boolean('hasPreviousPage', {
                      nullable: false,
                      description: `Used to indicate whether more edges exist prior to the set defined by the clients arguments.`,
                    })
                    t2.string('startCursor', {
                      nullable: true,
                      description: `The cursor corresponding to the first nodes in edges. Null if the connection is empty.`,
                    })
                    t2.string('endCursor', {
                      nullable: true,
                      description: `The cursor corresponding to the last nodes in edges. Null if the connection is empty.`,
                    })
                  },
                })
              )
            }
            const {
              disableBackwardPagination,
              disableForwardPagination,
              validateArgs = defaultValidateArgs,
              strictArgs = true,
            } = Object.assign(Object.assign({}, pluginConfig), fieldConfig)
            let specArgs = {}
            if (disableForwardPagination !== true && disableBackwardPagination !== true) {
              specArgs = Object.assign(Object.assign({}, ForwardPaginateArgs), BackwardPaginateArgs)
            } else if (disableForwardPagination !== true) {
              specArgs = strictArgs
                ? Object.assign({}, ForwardOnlyStrictArgs)
                : Object.assign({}, ForwardPaginateArgs)
            } else if (disableBackwardPagination !== true) {
              specArgs = strictArgs
                ? Object.assign({}, BackwardOnlyStrictArgs)
                : Object.assign({}, BackwardPaginateArgs)
            }
            // If we have additional args,
            let fieldAdditionalArgs = {}
            if (fieldConfig.additionalArgs) {
              if (additionalArgs && fieldConfig.inheritAdditionalArgs) {
                fieldAdditionalArgs = Object.assign(
                  Object.assign({}, additionalArgs),
                  fieldConfig.additionalArgs
                )
              } else {
                fieldAdditionalArgs = Object.assign({}, fieldConfig.additionalArgs)
              }
            } else if (additionalArgs) {
              fieldAdditionalArgs = Object.assign({}, additionalArgs)
            }
            const fieldArgs = Object.assign(Object.assign({}, fieldAdditionalArgs), specArgs)
            let resolveFn
            if (fieldConfig.resolve) {
              if (includeNodesField) {
                resolveFn = (root, args, ctx, info) => {
                  return plugin_1.completeValue(fieldConfig.resolve(root, args, ctx, info), (val) => {
                    if (val && val.nodes === undefined) {
                      return Object.assign(Object.assign({}, val), {
                        nodes: plugin_1.completeValue(val.edges, (edges) => edges.map((edge) => edge.node)),
                      })
                    }
                    return val
                  })
                }
              } else {
                resolveFn = fieldConfig.resolve
              }
            } else {
              resolveFn = makeResolveFn(pluginConfig, fieldConfig)
            }
            // Add the field to the type.
            t.field(
              fieldName,
              Object.assign(Object.assign({}, nonConnectionFieldProps(fieldConfig)), {
                args: fieldArgs,
                type: connectionName,
                resolve(root, args, ctx, info) {
                  validateArgs(args, info)
                  return resolveFn(root, args, ctx, info)
                },
              })
            )
          },
        })
      )
      // TODO: Deprecate this syntax
      return { types: [] }
    },
  })
}
// Extract all of the non-connection related field config we may want to apply for plugin purposes
function nonConnectionFieldProps(fieldConfig) {
  const {
      additionalArgs,
      cursorFromNode,
      disableBackwardPagination,
      disableForwardPagination,
      extendConnection,
      extendEdge,
      inheritAdditionalArgs,
      nodes,
      pageInfoFromNodes,
      resolve,
      type,
      validateArgs,
      strictArgs,
    } = fieldConfig,
    rest = tslib_1.__rest(fieldConfig, [
      'additionalArgs',
      'cursorFromNode',
      'disableBackwardPagination',
      'disableForwardPagination',
      'extendConnection',
      'extendEdge',
      'inheritAdditionalArgs',
      'nodes',
      'pageInfoFromNodes',
      'resolve',
      'type',
      'validateArgs',
      'strictArgs',
    ])
  return rest
}
function makeResolveFn(pluginConfig, fieldConfig) {
  const mergedConfig = Object.assign(Object.assign({}, pluginConfig), fieldConfig)
  return (root, args, ctx, info) => {
    const { nodes: nodesResolve } = fieldConfig
    const { decodeCursor = base64Decode, encodeCursor = base64Encode } = pluginConfig
    const {
      pageInfoFromNodes = defaultPageInfoFromNodes,
      cursorFromNode = defaultCursorFromNode,
    } = mergedConfig
    if (!nodesResolve) {
      return null
    }
    const formattedArgs = Object.assign({}, args)
    if (args.before) {
      formattedArgs.before = decodeCursor(args.before).replace(CURSOR_PREFIX, '')
    }
    if (args.after) {
      formattedArgs.after = decodeCursor(args.after).replace(CURSOR_PREFIX, '')
    }
    if (args.last && !args.before && cursorFromNode === defaultCursorFromNode) {
      throw new Error(`Cannot paginate backward without a "before" cursor by default.`)
    }
    // Local variable to cache the execution of fetching the nodes,
    // which is needed for all fields.
    let cachedNodes
    let cachedEdges
    // Get all the nodes, before any pagination sliciing
    const resolveAllNodes = () => {
      if (cachedNodes !== undefined) {
        return cachedNodes
      }
      cachedNodes = Promise.resolve(nodesResolve(root, formattedArgs, ctx, info) || null)
      return cachedNodes.then((allNodes) => (allNodes ? Array.from(allNodes) : allNodes))
    }
    const resolveEdgesAndNodes = () => {
      if (cachedEdges !== undefined) {
        return cachedEdges
      }
      cachedEdges = resolveAllNodes().then((allNodes) => {
        if (!allNodes) {
          const arrPath = JSON.stringify(utils_1.pathToArray(info.path))
          console.warn(
            `You resolved null/undefined from nodes() at path ${arrPath}, this is likely an error. Return an empty array to suppress this warning.`
          )
          return { edges: [], nodes: [] }
        }
        const resolvedEdgeList = []
        const resolvedNodeList = []
        let hasPromise = false
        iterateNodes(allNodes, args, (maybeNode, i) => {
          if (utils_1.isPromiseLike(maybeNode)) {
            hasPromise = true
            resolvedNodeList.push(maybeNode)
            resolvedEdgeList.push(
              maybeNode.then((node) => {
                return plugin_1.completeValue(
                  cursorFromNode(maybeNode, formattedArgs, ctx, info, {
                    index: i,
                    nodes: allNodes,
                  }),
                  (rawCursor) => {
                    return {
                      cursor: encodeCursor(rawCursor),
                      node,
                    }
                  }
                )
              })
            )
          } else {
            resolvedNodeList.push(maybeNode)
            resolvedEdgeList.push({
              node: maybeNode,
              cursor: plugin_1.completeValue(
                cursorFromNode(maybeNode, formattedArgs, ctx, info, {
                  index: i,
                  nodes: allNodes,
                }),
                (rawCursor) => encodeCursor(rawCursor)
              ),
            })
          }
        })
        if (hasPromise) {
          return Promise.all([
            Promise.all(resolvedEdgeList),
            Promise.all(resolvedNodeList),
          ]).then(([edges, nodes]) => ({ edges, nodes }))
        }
        return {
          nodes: resolvedNodeList,
          // todo find typesafe way of doing this
          edges: resolvedEdgeList,
        }
      })
      return cachedEdges
    }
    const resolvePageInfo = () =>
      tslib_1.__awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c
        const [allNodes, { edges }] = yield Promise.all([resolveAllNodes(), resolveEdgesAndNodes()])
        let basePageInfo = allNodes
          ? pageInfoFromNodes(allNodes, args, ctx, info)
          : {
              hasNextPage: false,
              hasPreviousPage: false,
            }
        return Object.assign(Object.assign({}, basePageInfo), {
          startCursor: (
            (_a = edges === null || edges === void 0 ? void 0 : edges[0]) === null || _a === void 0
              ? void 0
              : _a.cursor
          )
            ? edges[0].cursor
            : null,
          endCursor:
            (_c =
              (_b = edges === null || edges === void 0 ? void 0 : edges[edges.length - 1]) === null ||
              _b === void 0
                ? void 0
                : _b.cursor) !== null && _c !== void 0
              ? _c
              : null,
        })
      })
    return {
      get nodes() {
        return resolveEdgesAndNodes().then((o) => o.nodes)
      },
      get edges() {
        return resolveEdgesAndNodes().then((o) => o.edges)
      },
      get pageInfo() {
        return resolvePageInfo()
      },
    }
  }
}
exports.makeResolveFn = makeResolveFn
function iterateNodes(nodes, args, cb) {
  // If we want the first N of an array of nodes, it's pretty straightforward.
  if (args.first) {
    for (let i = 0; i < args.first; i++) {
      if (i < nodes.length) {
        cb(nodes[i], i)
      }
    }
  } else if (args.last) {
    for (let i = 0; i < args.last; i++) {
      const idx = nodes.length - args.last + i
      if (idx >= 0) {
        cb(nodes[idx], i)
      }
    }
  }
}
function defaultPageInfoFromNodes(nodes, args) {
  return {
    hasNextPage: defaultHasNextPage(nodes, args),
    hasPreviousPage: defaultHasPreviousPage(nodes, args),
  }
}
function defaultHasNextPage(nodes, args) {
  // If we're paginating forward, and we don't have an "after", we'll assume that we don't have
  // a previous page, otherwise we will assume we have one, unless the after cursor === "0".
  if (typeof args.first === 'number') {
    return nodes.length > args.first
  }
  // If we're paginating backward, and there are as many results as we asked for, then we'll assume
  // that we have a previous page
  if (typeof args.last === 'number') {
    if (args.before && args.before !== '0') {
      return true
    }
    return false
  }
  /* istanbul ignore next */
  throw new Error('Unreachable')
}
/**
 * A sensible default for determining "previous page".
 */
function defaultHasPreviousPage(nodes, args) {
  // If we're paginating forward, and we don't have an "after", we'll assume that we don't have
  // a previous page, otherwise we will assume we have one, unless the after cursor === "0".
  if (typeof args.first === 'number') {
    if (args.after && args.after !== '0') {
      return true
    }
    return false
  }
  // If we're paginating backward, and there are as many results as we asked for, then we'll assume
  // that we have a previous page
  if (typeof args.last === 'number') {
    return nodes.length >= args.last
  }
  /* istanbul ignore next */
  throw new Error('Unreachable')
}
const CURSOR_PREFIX = 'cursor:'
// Assumes we're only paginating in one direction.
function defaultCursorFromNode(node, args, ctx, info, { index }) {
  let cursorIndex = index
  // If we're paginating forward, assume we're incrementing from the offset provided via "after",
  // e.g. [0...20] (first: 5, after: "cursor:5") -> [cursor:6, cursor:7, cursor:8, cursor:9, cursor: 10]
  if (typeof args.first === 'number') {
    if (args.after) {
      const offset = parseInt(args.after, 10)
      cursorIndex = offset + index + 1
    }
  }
  // If we're paginating backward, assume we're working backward from the assumed length
  // e.g. [0...20] (last: 5, before: "cursor:20") -> [cursor:15, cursor:16, cursor:17, cursor:18, cursor:19]
  if (typeof args.last === 'number') {
    if (args.before) {
      const offset = parseInt(args.before, 10)
      cursorIndex = offset - args.last + index
    } else {
      /* istanbul ignore next */
      throw new Error('Unreachable')
    }
  }
  return `${CURSOR_PREFIX}${cursorIndex}`
}
const getTypeNames = (fieldName, parentTypeName, fieldConfig, pluginConfig) => {
  const targetTypeName = typeof fieldConfig.type === 'string' ? fieldConfig.type : fieldConfig.type.name
  // If we have changed the config specific to this field, on either the connection,
  // edge, or page info, then we need a custom type for the connection & edge.
  let connectionName
  if (isConnectionFieldExtended(fieldConfig)) {
    connectionName = `${parentTypeName}${upperFirst(fieldName)}_Connection`
  } else {
    connectionName = `${pluginConfig.typePrefix || ''}${targetTypeName}Connection`
  }
  // If we have modified the "edge" at all, then we need
  let edgeName
  if (isEdgeFieldExtended(fieldConfig)) {
    edgeName = `${parentTypeName}${upperFirst(fieldName)}_Edge`
  } else {
    edgeName = `${pluginConfig.typePrefix || ''}${targetTypeName}Edge`
  }
  return {
    edgeName,
    targetTypeName,
    connectionName,
  }
}
const isConnectionFieldExtended = (fieldConfig) => {
  if (fieldConfig.extendConnection || isEdgeFieldExtended(fieldConfig)) {
    return true
  }
  return false
}
const isEdgeFieldExtended = (fieldConfig) => {
  if (fieldConfig.extendEdge) {
    return true
  }
  return false
}
const upperFirst = (fieldName) => {
  return fieldName.slice(0, 1).toUpperCase().concat(fieldName.slice(1))
}
// Add some sanity checking beyond the normal type checks.
const assertCorrectConfig = (typeName, fieldName, pluginConfig, fieldConfig) => {
  if (typeof fieldConfig.nodes !== 'function' && typeof fieldConfig.resolve !== 'function') {
    console.error(
      new Error(`Nexus Connection Plugin: Missing nodes or resolve property for ${typeName}.${fieldName}`)
    )
  }
  utils_1.eachObj(pluginConfig.extendConnection || {}, (val, key) => {
    if (typeof fieldConfig[key] !== 'function') {
      console.error(
        new Error(`Nexus Connection Plugin: Missing ${key} resolver property for ${typeName}.${fieldName}`)
      )
    }
  })
  utils_1.eachObj(pluginConfig.extendEdge || {}, (val, key) => {
    if (!utils_1.isObject(fieldConfig.edgeFields) || typeof fieldConfig.edgeFields[key] !== 'function') {
      console.error(
        new Error(
          `Nexus Connection Plugin: Missing edgeFields.${key} resolver property for ${typeName}.${fieldName}`
        )
      )
    }
  })
}
function defaultValidateArgs(args = {}, info) {
  if (!(args.first || args.first === 0) && !(args.last || args.last === 0)) {
    throw new Error(
      `The ${info.parentType}.${info.fieldName} connection field requires a "first" or "last" argument`
    )
  }
  if (args.first && args.last) {
    throw new Error(
      `The ${info.parentType}.${info.fieldName} connection field requires a "first" or "last" argument, not both`
    )
  }
  if (args.first && args.before) {
    throw new Error(
      `The ${info.parentType}.${info.fieldName} connection field does not allow a "before" argument with "first"`
    )
  }
  if (args.last && args.after) {
    throw new Error(
      `The ${info.parentType}.${info.fieldName} connection field does not allow a "last" argument with "after"`
    )
  }
}
// Provided for use if you create a custom implementation and want to call the original.
exports.connectionPlugin.defaultCursorFromNode = defaultCursorFromNode
exports.connectionPlugin.defaultValidateArgs = defaultValidateArgs
exports.connectionPlugin.defaultHasPreviousPage = defaultHasPreviousPage
exports.connectionPlugin.defaultHasNextPage = defaultHasNextPage
//# sourceMappingURL=connectionPlugin.js.map
