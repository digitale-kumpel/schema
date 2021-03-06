'use strict'
Object.defineProperty(exports, '__esModule', { value: true })
exports.withNexusSymbol = exports.NexusWrappedSymbol = exports.NexusTypes = void 0
var NexusTypes
;(function (NexusTypes) {
  NexusTypes['Arg'] = 'Arg'
  NexusTypes['Enum'] = 'Enum'
  NexusTypes['Object'] = 'Object'
  NexusTypes['Interface'] = 'Interface'
  NexusTypes['InputObject'] = 'InputObject'
  NexusTypes['Scalar'] = 'Scalar'
  NexusTypes['Union'] = 'Union'
  NexusTypes['ExtendObject'] = 'ExtendObject'
  NexusTypes['ExtendInputObject'] = 'ExtendInputObject'
  NexusTypes['OutputField'] = 'OutputField'
  NexusTypes['InputField'] = 'InputField'
  NexusTypes['DynamicInput'] = 'DynamicInput'
  NexusTypes['DynamicOutputMethod'] = 'DynamicOutputMethod'
  NexusTypes['DynamicOutputProperty'] = 'DynamicOutputProperty'
  NexusTypes['Plugin'] = 'Plugin'
  NexusTypes['PrintedGenTyping'] = 'PrintedGenTyping'
  NexusTypes['PrintedGenTypingImport'] = 'PrintedGenTypingImport'
})((NexusTypes = exports.NexusTypes || (exports.NexusTypes = {})))
exports.NexusWrappedSymbol = Symbol.for('@nexus/wrapped')
function withNexusSymbol(obj, nexusType) {
  obj.prototype[exports.NexusWrappedSymbol] = nexusType
}
exports.withNexusSymbol = withNexusSymbol
//# sourceMappingURL=_types.js.map
