'use strict'
Object.defineProperty(exports, '__esModule', { value: true })
exports.mutationType = exports.queryType = exports.objectType = exports.NexusObjectTypeDef = exports.ObjectDefinitionBlock = void 0
const graphql_1 = require('graphql')
const definitionBlocks_1 = require('./definitionBlocks')
const _types_1 = require('./_types')
class ObjectDefinitionBlock extends definitionBlocks_1.OutputDefinitionBlock {
  constructor(typeBuilder) {
    super(typeBuilder)
    this.typeBuilder = typeBuilder
  }
  /**
   * @param interfaceName
   */
  implements(...interfaceName) {
    this.typeBuilder.addInterfaces(interfaceName)
  }
  /**
   * Modifies a field added via an interface
   */
  modify(field, modifications) {
    throw new Error(`
      The Nexus objectType.modify API has been removed. If you were using this API, please open an issue on 
      GitHub to discuss your use case so we can discuss a suitable replacement.
    `)
  }
}
exports.ObjectDefinitionBlock = ObjectDefinitionBlock
class NexusObjectTypeDef {
  constructor(name, config) {
    this.name = name
    this.config = config
    graphql_1.assertValidName(name)
  }
  get value() {
    return this.config
  }
}
exports.NexusObjectTypeDef = NexusObjectTypeDef
_types_1.withNexusSymbol(NexusObjectTypeDef, _types_1.NexusTypes.Object)
function objectType(config) {
  return new NexusObjectTypeDef(config.name, config)
}
exports.objectType = objectType
function queryType(config) {
  return objectType(Object.assign(Object.assign({}, config), { name: 'Query' }))
}
exports.queryType = queryType
function mutationType(config) {
  return objectType(Object.assign(Object.assign({}, config), { name: 'Mutation' }))
}
exports.mutationType = mutationType
//# sourceMappingURL=objectType.js.map
