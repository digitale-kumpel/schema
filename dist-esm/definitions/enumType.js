import { assertValidName } from 'graphql'
import { NexusTypes, withNexusSymbol } from './_types'
export class NexusEnumTypeDef {
  constructor(name, config) {
    this.name = name
    this.config = config
    assertValidName(name)
  }
  get value() {
    return this.config
  }
}
withNexusSymbol(NexusEnumTypeDef, NexusTypes.Enum)
export function enumType(config) {
  return new NexusEnumTypeDef(config.name, config)
}
//# sourceMappingURL=enumType.js.map
