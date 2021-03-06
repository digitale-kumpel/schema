'use strict'
Object.defineProperty(exports, '__esModule', { value: true })
exports.isNexusPlugin = exports.isNexusPrintedGenTypingImport = exports.isNexusPrintedGenTyping = exports.isNexusDynamicInputMethod = exports.isNexusDynamicOutputMethod = exports.isNexusDynamicOutputProperty = exports.isNexusArgDef = exports.isNexusInterfaceTypeDef = exports.isNexusUnionTypeDef = exports.isNexusScalarTypeDef = exports.isNexusObjectTypeDef = exports.isNexusInputObjectTypeDef = exports.isNexusEnumTypeDef = exports.isNexusExtendTypeDef = exports.isNexusExtendInputTypeDef = exports.isNexusNamedTypeDef = exports.isNexusStruct = exports.isNexusTypeDef = void 0
const _types_1 = require('./_types')
const NamedTypeDefs = new Set([
  _types_1.NexusTypes.Enum,
  _types_1.NexusTypes.Object,
  _types_1.NexusTypes.Scalar,
  _types_1.NexusTypes.Union,
  _types_1.NexusTypes.Interface,
  _types_1.NexusTypes.InputObject,
])
exports.isNexusTypeDef = (obj) => {
  console.warn(`isNexusTypeDef is deprecated, use isNexusStruct`)
  return isNexusStruct(obj)
}
function isNexusStruct(obj) {
  return obj && Boolean(obj[_types_1.NexusWrappedSymbol])
}
exports.isNexusStruct = isNexusStruct
function isNexusNamedTypeDef(obj) {
  return isNexusStruct(obj) && NamedTypeDefs.has(obj[_types_1.NexusWrappedSymbol])
}
exports.isNexusNamedTypeDef = isNexusNamedTypeDef
function isNexusExtendInputTypeDef(obj) {
  return isNexusStruct(obj) && obj[_types_1.NexusWrappedSymbol] === _types_1.NexusTypes.ExtendInputObject
}
exports.isNexusExtendInputTypeDef = isNexusExtendInputTypeDef
function isNexusExtendTypeDef(obj) {
  return isNexusStruct(obj) && obj[_types_1.NexusWrappedSymbol] === _types_1.NexusTypes.ExtendObject
}
exports.isNexusExtendTypeDef = isNexusExtendTypeDef
function isNexusEnumTypeDef(obj) {
  return isNexusStruct(obj) && obj[_types_1.NexusWrappedSymbol] === _types_1.NexusTypes.Enum
}
exports.isNexusEnumTypeDef = isNexusEnumTypeDef
function isNexusInputObjectTypeDef(obj) {
  return isNexusStruct(obj) && obj[_types_1.NexusWrappedSymbol] === _types_1.NexusTypes.InputObject
}
exports.isNexusInputObjectTypeDef = isNexusInputObjectTypeDef
function isNexusObjectTypeDef(obj) {
  return isNexusStruct(obj) && obj[_types_1.NexusWrappedSymbol] === _types_1.NexusTypes.Object
}
exports.isNexusObjectTypeDef = isNexusObjectTypeDef
function isNexusScalarTypeDef(obj) {
  return isNexusStruct(obj) && obj[_types_1.NexusWrappedSymbol] === _types_1.NexusTypes.Scalar
}
exports.isNexusScalarTypeDef = isNexusScalarTypeDef
function isNexusUnionTypeDef(obj) {
  return isNexusStruct(obj) && obj[_types_1.NexusWrappedSymbol] === _types_1.NexusTypes.Union
}
exports.isNexusUnionTypeDef = isNexusUnionTypeDef
function isNexusInterfaceTypeDef(obj) {
  return isNexusStruct(obj) && obj[_types_1.NexusWrappedSymbol] === _types_1.NexusTypes.Interface
}
exports.isNexusInterfaceTypeDef = isNexusInterfaceTypeDef
function isNexusArgDef(obj) {
  return isNexusStruct(obj) && obj[_types_1.NexusWrappedSymbol] === _types_1.NexusTypes.Arg
}
exports.isNexusArgDef = isNexusArgDef
function isNexusDynamicOutputProperty(obj) {
  return isNexusStruct(obj) && obj[_types_1.NexusWrappedSymbol] === _types_1.NexusTypes.DynamicOutputProperty
}
exports.isNexusDynamicOutputProperty = isNexusDynamicOutputProperty
function isNexusDynamicOutputMethod(obj) {
  return isNexusStruct(obj) && obj[_types_1.NexusWrappedSymbol] === _types_1.NexusTypes.DynamicOutputMethod
}
exports.isNexusDynamicOutputMethod = isNexusDynamicOutputMethod
function isNexusDynamicInputMethod(obj) {
  return isNexusStruct(obj) && obj[_types_1.NexusWrappedSymbol] === _types_1.NexusTypes.DynamicInput
}
exports.isNexusDynamicInputMethod = isNexusDynamicInputMethod
function isNexusPrintedGenTyping(obj) {
  return isNexusStruct(obj) && obj[_types_1.NexusWrappedSymbol] === _types_1.NexusTypes.PrintedGenTyping
}
exports.isNexusPrintedGenTyping = isNexusPrintedGenTyping
function isNexusPrintedGenTypingImport(obj) {
  return isNexusStruct(obj) && obj[_types_1.NexusWrappedSymbol] === _types_1.NexusTypes.PrintedGenTypingImport
}
exports.isNexusPrintedGenTypingImport = isNexusPrintedGenTypingImport
function isNexusPlugin(obj) {
  return isNexusStruct(obj) && obj[_types_1.NexusWrappedSymbol] === _types_1.NexusTypes.Plugin
}
exports.isNexusPlugin = isNexusPlugin
//# sourceMappingURL=wrapping.js.map
