import { GraphQLNamedType } from 'graphql'
import { DynamicInputMethodDef, DynamicOutputMethodDef } from '../dynamicMethod'
import { DynamicOutputPropertyDef } from '../dynamicProperty'
import { NexusPlugin } from '../plugin'
import { AllInputTypes } from '../typegenTypeHelpers'
import { PrintedGenTyping, PrintedGenTypingImport } from '../utils'
import { NexusArgDef } from './args'
import { NexusEnumTypeDef } from './enumType'
import { NexusExtendInputTypeDef } from './extendInputType'
import { NexusExtendTypeDef } from './extendType'
import { NexusInputObjectTypeDef } from './inputObjectType'
import { NexusInterfaceTypeDef } from './interfaceType'
import { NexusObjectTypeDef } from './objectType'
import { NexusScalarTypeDef } from './scalarType'
import { NexusUnionTypeDef } from './unionType'
import { NexusTypes, NexusWrappedSymbol } from './_types'
export declare type AllNexusInputTypeDefs<T extends string = any> =
  | NexusInputObjectTypeDef<T>
  | NexusEnumTypeDef<T>
  | NexusScalarTypeDef<T>
export declare type AllNexusOutputTypeDefs =
  | NexusObjectTypeDef<any>
  | NexusInterfaceTypeDef<any>
  | NexusUnionTypeDef<any>
  | NexusEnumTypeDef<any>
  | NexusScalarTypeDef<any>
export declare type AllNexusNamedTypeDefs = AllNexusInputTypeDefs | AllNexusOutputTypeDefs
export declare type AllTypeDefs = AllNexusInputTypeDefs | AllNexusOutputTypeDefs | GraphQLNamedType
export declare const isNexusTypeDef: (
  obj: any
) => obj is {
  [NexusWrappedSymbol]: NexusTypes
}
export declare function isNexusStruct(
  obj: any
): obj is {
  [NexusWrappedSymbol]: NexusTypes
}
export declare function isNexusNamedTypeDef(obj: any): obj is AllNexusNamedTypeDefs
export declare function isNexusExtendInputTypeDef(obj: any): obj is NexusExtendInputTypeDef<string>
export declare function isNexusExtendTypeDef(obj: any): obj is NexusExtendTypeDef<string>
export declare function isNexusEnumTypeDef(obj: any): obj is NexusEnumTypeDef<string>
export declare function isNexusInputObjectTypeDef(obj: any): obj is NexusInputObjectTypeDef<string>
export declare function isNexusObjectTypeDef(obj: any): obj is NexusObjectTypeDef<string>
export declare function isNexusScalarTypeDef(obj: any): obj is NexusScalarTypeDef<string>
export declare function isNexusUnionTypeDef(obj: any): obj is NexusUnionTypeDef<string>
export declare function isNexusInterfaceTypeDef(obj: any): obj is NexusInterfaceTypeDef<string>
export declare function isNexusArgDef(obj: any): obj is NexusArgDef<AllInputTypes>
export declare function isNexusDynamicOutputProperty<T extends string>(
  obj: any
): obj is DynamicOutputPropertyDef<T>
export declare function isNexusDynamicOutputMethod<T extends string>(
  obj: any
): obj is DynamicOutputMethodDef<T>
export declare function isNexusDynamicInputMethod<T extends string>(obj: any): obj is DynamicInputMethodDef<T>
export declare function isNexusPrintedGenTyping(obj: any): obj is PrintedGenTyping
export declare function isNexusPrintedGenTypingImport(obj: any): obj is PrintedGenTypingImport
export declare function isNexusPlugin(obj: any): obj is NexusPlugin
