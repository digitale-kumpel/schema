'use strict'
Object.defineProperty(exports, '__esModule', { value: true })
exports.inputObjectType = exports.NexusInputObjectTypeDef = void 0
const graphql_1 = require('graphql')
const args_1 = require('./args')
const _types_1 = require('./_types')
class NexusInputObjectTypeDef {
  constructor(name, config) {
    this.name = name
    this.config = config
    graphql_1.assertValidName(name)
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
    return args_1.arg(Object.assign(Object.assign({}, cfg), { type: this }))
  }
}
exports.NexusInputObjectTypeDef = NexusInputObjectTypeDef
_types_1.withNexusSymbol(NexusInputObjectTypeDef, _types_1.NexusTypes.InputObject)
function inputObjectType(config) {
  return new NexusInputObjectTypeDef(config.name, config)
}
exports.inputObjectType = inputObjectType
//# sourceMappingURL=inputObjectType.js.map
