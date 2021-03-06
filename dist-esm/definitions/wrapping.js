import { NexusTypes, NexusWrappedSymbol } from './_types'
const NamedTypeDefs = new Set([
  NexusTypes.Enum,
  NexusTypes.Object,
  NexusTypes.Scalar,
  NexusTypes.Union,
  NexusTypes.Interface,
  NexusTypes.InputObject,
])
export const isNexusTypeDef = (obj) => {
  console.warn(`isNexusTypeDef is deprecated, use isNexusStruct`)
  return isNexusStruct(obj)
}
export function isNexusStruct(obj) {
  return obj && Boolean(obj[NexusWrappedSymbol])
}
export function isNexusNamedTypeDef(obj) {
  return isNexusStruct(obj) && NamedTypeDefs.has(obj[NexusWrappedSymbol])
}
export function isNexusExtendInputTypeDef(obj) {
  return isNexusStruct(obj) && obj[NexusWrappedSymbol] === NexusTypes.ExtendInputObject
}
export function isNexusExtendTypeDef(obj) {
  return isNexusStruct(obj) && obj[NexusWrappedSymbol] === NexusTypes.ExtendObject
}
export function isNexusEnumTypeDef(obj) {
  return isNexusStruct(obj) && obj[NexusWrappedSymbol] === NexusTypes.Enum
}
export function isNexusInputObjectTypeDef(obj) {
  return isNexusStruct(obj) && obj[NexusWrappedSymbol] === NexusTypes.InputObject
}
export function isNexusObjectTypeDef(obj) {
  return isNexusStruct(obj) && obj[NexusWrappedSymbol] === NexusTypes.Object
}
export function isNexusScalarTypeDef(obj) {
  return isNexusStruct(obj) && obj[NexusWrappedSymbol] === NexusTypes.Scalar
}
export function isNexusUnionTypeDef(obj) {
  return isNexusStruct(obj) && obj[NexusWrappedSymbol] === NexusTypes.Union
}
export function isNexusInterfaceTypeDef(obj) {
  return isNexusStruct(obj) && obj[NexusWrappedSymbol] === NexusTypes.Interface
}
export function isNexusArgDef(obj) {
  return isNexusStruct(obj) && obj[NexusWrappedSymbol] === NexusTypes.Arg
}
export function isNexusDynamicOutputProperty(obj) {
  return isNexusStruct(obj) && obj[NexusWrappedSymbol] === NexusTypes.DynamicOutputProperty
}
export function isNexusDynamicOutputMethod(obj) {
  return isNexusStruct(obj) && obj[NexusWrappedSymbol] === NexusTypes.DynamicOutputMethod
}
export function isNexusDynamicInputMethod(obj) {
  return isNexusStruct(obj) && obj[NexusWrappedSymbol] === NexusTypes.DynamicInput
}
export function isNexusPrintedGenTyping(obj) {
  return isNexusStruct(obj) && obj[NexusWrappedSymbol] === NexusTypes.PrintedGenTyping
}
export function isNexusPrintedGenTypingImport(obj) {
  return isNexusStruct(obj) && obj[NexusWrappedSymbol] === NexusTypes.PrintedGenTypingImport
}
export function isNexusPlugin(obj) {
  return isNexusStruct(obj) && obj[NexusWrappedSymbol] === NexusTypes.Plugin
}
//# sourceMappingURL=wrapping.js.map
