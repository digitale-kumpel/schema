'use strict'
Object.defineProperty(exports, '__esModule', { value: true })
exports.enumType = exports.NexusEnumTypeDef = void 0
const graphql_1 = require('graphql')
const _types_1 = require('./_types')
class NexusEnumTypeDef {
  constructor(name, config) {
    this.name = name
    this.config = config
    graphql_1.assertValidName(name)
  }
  get value() {
    return this.config
  }
}
exports.NexusEnumTypeDef = NexusEnumTypeDef
_types_1.withNexusSymbol(NexusEnumTypeDef, _types_1.NexusTypes.Enum)
function enumType(config) {
  return new NexusEnumTypeDef(config.name, config)
}
exports.enumType = enumType
//# sourceMappingURL=enumType.js.map
