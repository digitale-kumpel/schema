'use strict'
Object.defineProperty(exports, '__esModule', { value: true })
exports.interfaceType = exports.NexusInterfaceTypeDef = exports.InterfaceDefinitionBlock = void 0
const graphql_1 = require('graphql')
const definitionBlocks_1 = require('./definitionBlocks')
const _types_1 = require('./_types')
class InterfaceDefinitionBlock extends definitionBlocks_1.OutputDefinitionBlock {
  constructor(typeBuilder) {
    super(typeBuilder)
    this.typeBuilder = typeBuilder
  }
  /**
   * Sets the "resolveType" method for the current type.
   */
  resolveType(fn) {
    this.typeBuilder.setResolveType(fn)
  }
}
exports.InterfaceDefinitionBlock = InterfaceDefinitionBlock
class NexusInterfaceTypeDef {
  constructor(name, config) {
    this.name = name
    this.config = config
    graphql_1.assertValidName(name)
  }
  get value() {
    return this.config
  }
}
exports.NexusInterfaceTypeDef = NexusInterfaceTypeDef
_types_1.withNexusSymbol(NexusInterfaceTypeDef, _types_1.NexusTypes.Interface)
/**
 * Defines a GraphQLInterfaceType
 * @param config
 */
function interfaceType(config) {
  return new NexusInterfaceTypeDef(config.name, config)
}
exports.interfaceType = interfaceType
//# sourceMappingURL=interfaceType.js.map
