import { assertValidName } from 'graphql'
import { OutputDefinitionBlock } from './definitionBlocks'
import { NexusTypes, withNexusSymbol } from './_types'
export class InterfaceDefinitionBlock extends OutputDefinitionBlock {
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
export class NexusInterfaceTypeDef {
  constructor(name, config) {
    this.name = name
    this.config = config
    assertValidName(name)
  }
  get value() {
    return this.config
  }
}
withNexusSymbol(NexusInterfaceTypeDef, NexusTypes.Interface)
/**
 * Defines a GraphQLInterfaceType
 * @param config
 */
export function interfaceType(config) {
  return new NexusInterfaceTypeDef(config.name, config)
}
//# sourceMappingURL=interfaceType.js.map
