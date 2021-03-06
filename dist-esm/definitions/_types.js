export var NexusTypes
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
})(NexusTypes || (NexusTypes = {}))
export const NexusWrappedSymbol = Symbol.for('@nexus/wrapped')
export function withNexusSymbol(obj, nexusType) {
  obj.prototype[NexusWrappedSymbol] = nexusType
}
//# sourceMappingURL=_types.js.map
