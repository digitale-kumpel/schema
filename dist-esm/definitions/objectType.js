import { assertValidName } from 'graphql'
import { OutputDefinitionBlock } from './definitionBlocks'
import { NexusTypes, withNexusSymbol } from './_types'
export class ObjectDefinitionBlock extends OutputDefinitionBlock {
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
export class NexusObjectTypeDef {
  constructor(name, config) {
    this.name = name
    this.config = config
    assertValidName(name)
  }
  get value() {
    return this.config
  }
}
withNexusSymbol(NexusObjectTypeDef, NexusTypes.Object)
export function objectType(config) {
  return new NexusObjectTypeDef(config.name, config)
}
export function queryType(config) {
  return objectType(Object.assign(Object.assign({}, config), { name: 'Query' }))
}
export function mutationType(config) {
  return objectType(Object.assign(Object.assign({}, config), { name: 'Mutation' }))
}
//# sourceMappingURL=objectType.js.map
