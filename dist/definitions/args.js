'use strict'
Object.defineProperty(exports, '__esModule', { value: true })
exports.booleanArg = exports.idArg = exports.floatArg = exports.intArg = exports.stringArg = exports.arg = exports.NexusArgDef = void 0
const _types_1 = require('./_types')
class NexusArgDef {
  constructor(name, config) {
    this.name = name
    this.config = config
  }
  get value() {
    return this.config
  }
}
exports.NexusArgDef = NexusArgDef
_types_1.withNexusSymbol(NexusArgDef, _types_1.NexusTypes.Arg)
/**
 * Defines an argument that can be used in any object or interface type
 *
 * Takes the GraphQL type name and any options.
 *
 * The value returned from this argument can be used multiple times in any valid `args` object value
 *
 * @see https://graphql.github.io/learn/schema/#arguments
 */
function arg(options) {
  if (!options.type) {
    throw new Error('You must provide a "type" for the arg()')
  }
  return new NexusArgDef(typeof options.type === 'string' ? options.type : options.type.name, options)
}
exports.arg = arg
function stringArg(options) {
  return arg(Object.assign({ type: 'String' }, options))
}
exports.stringArg = stringArg
function intArg(options) {
  return arg(Object.assign({ type: 'Int' }, options))
}
exports.intArg = intArg
function floatArg(options) {
  return arg(Object.assign({ type: 'Float' }, options))
}
exports.floatArg = floatArg
function idArg(options) {
  return arg(Object.assign({ type: 'ID' }, options))
}
exports.idArg = idArg
function booleanArg(options) {
  return arg(Object.assign({ type: 'Boolean' }, options))
}
exports.booleanArg = booleanArg
//# sourceMappingURL=args.js.map
