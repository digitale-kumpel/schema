import { assertValidName } from 'graphql'
import { NexusTypes, withNexusSymbol } from './_types'
export class NexusExtendTypeDef {
  constructor(name, config) {
    this.name = name
    this.config = config
    assertValidName(name)
  }
  get value() {
    return this.config
  }
}
withNexusSymbol(NexusExtendTypeDef, NexusTypes.ExtendObject)
/**
 * Adds new fields to an existing objectType in the schema. Useful when
 * splitting your schema across several domains.
 *
 * @see http://graphql-nexus.com/api/extendType
 */
export function extendType(config) {
  return new NexusExtendTypeDef(config.type, Object.assign(Object.assign({}, config), { name: config.type }))
}
//# sourceMappingURL=extendType.js.map
