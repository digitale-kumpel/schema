import { assertValidName } from 'graphql'
import { NexusTypes, withNexusSymbol } from './_types'
export class UnionDefinitionBlock {
  constructor(typeBuilder) {
    this.typeBuilder = typeBuilder
  }
  /**
   * All ObjectType names that should be part of the union, either
   * as string names or as references to the `objectType()` return value
   */
  members(...unionMembers) {
    this.typeBuilder.addUnionMembers(unionMembers)
  }
  /**
   * Sets the "resolveType" method for the current union
   */
  resolveType(fn) {
    this.typeBuilder.setResolveType(fn)
  }
}
export class NexusUnionTypeDef {
  constructor(name, config) {
    this.name = name
    this.config = config
    assertValidName(name)
  }
  get value() {
    return this.config
  }
}
withNexusSymbol(NexusUnionTypeDef, NexusTypes.Union)
/**
 * Defines a new `GraphQLUnionType`
 * @param config
 */
export function unionType(config) {
  return new NexusUnionTypeDef(config.name, config)
}
//# sourceMappingURL=unionType.js.map
