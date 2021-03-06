import { assertValidName } from 'graphql'
import { arg } from './args'
import { NexusTypes, withNexusSymbol } from './_types'
export class NexusInputObjectTypeDef {
  constructor(name, config) {
    this.name = name
    this.config = config
    assertValidName(name)
  }
  get value() {
    return this.config
  }
  // FIXME
  // Instead of `any` we want to pass the name of this type...
  // so that the correct `cfg.default` type can be looked up
  // from the typegen.
  asArg(cfg) {
    // FIXME
    return arg(Object.assign(Object.assign({}, cfg), { type: this }))
  }
}
withNexusSymbol(NexusInputObjectTypeDef, NexusTypes.InputObject)
export function inputObjectType(config) {
  return new NexusInputObjectTypeDef(config.name, config)
}
//# sourceMappingURL=inputObjectType.js.map
