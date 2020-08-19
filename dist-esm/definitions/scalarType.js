import { assertValidName } from 'graphql'
import { decorateType } from './decorateType'
import { NexusTypes, withNexusSymbol } from './_types'
export class NexusScalarTypeDef {
  constructor(name, config) {
    this.name = name
    this.config = config
    assertValidName(name)
  }
  get value() {
    return this.config
  }
}
withNexusSymbol(NexusScalarTypeDef, NexusTypes.Scalar)
export function scalarType(options) {
  return new NexusScalarTypeDef(options.name, options)
}
export function asNexusMethod(scalar, methodName, rootTyping) {
  return decorateType(scalar, {
    asNexusMethod: methodName,
    rootTyping: rootTyping,
  })
}
//# sourceMappingURL=scalarType.js.map
