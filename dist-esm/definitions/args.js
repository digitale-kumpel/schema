import { NexusTypes, withNexusSymbol } from './_types'
export class NexusArgDef {
  constructor(name, config) {
    this.name = name
    this.config = config
  }
  get value() {
    return this.config
  }
}
withNexusSymbol(NexusArgDef, NexusTypes.Arg)
/**
 * Defines an argument that can be used in any object or interface type
 *
 * Takes the GraphQL type name and any options.
 *
 * The value returned from this argument can be used multiple times in any valid `args` object value
 *
 * @see https://graphql.github.io/learn/schema/#arguments
 */
export function arg(options) {
  if (!options.type) {
    throw new Error('You must provide a "type" for the arg()')
  }
  return new NexusArgDef(typeof options.type === 'string' ? options.type : options.type.name, options)
}
export function stringArg(options) {
  return arg(Object.assign({ type: 'String' }, options))
}
export function intArg(options) {
  return arg(Object.assign({ type: 'Int' }, options))
}
export function floatArg(options) {
  return arg(Object.assign({ type: 'Float' }, options))
}
export function idArg(options) {
  return arg(Object.assign({ type: 'ID' }, options))
}
export function booleanArg(options) {
  return arg(Object.assign({ type: 'Boolean' }, options))
}
//# sourceMappingURL=args.js.map
