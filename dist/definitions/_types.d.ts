import {
  GraphQLCompositeType,
  GraphQLEnumType,
  GraphQLFieldConfig,
  GraphQLInputObjectType,
  GraphQLInputObjectTypeConfig,
  GraphQLInterfaceType,
  GraphQLInterfaceTypeConfig,
  GraphQLLeafType,
  GraphQLObjectType,
  GraphQLObjectTypeConfig,
  GraphQLScalarType,
  GraphQLSchema,
  GraphQLUnionType,
} from 'graphql'
import {
  NexusFieldExtension,
  NexusInputObjectTypeExtension,
  NexusInterfaceTypeExtension,
  NexusObjectTypeExtension,
  NexusSchemaExtension,
} from '../extensions'
export declare type Maybe<T> = T | null
export declare type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>
export declare type BaseScalars = 'String' | 'Int' | 'Float' | 'ID' | 'Boolean'
export declare enum NexusTypes {
  Arg = 'Arg',
  Enum = 'Enum',
  Object = 'Object',
  Interface = 'Interface',
  InputObject = 'InputObject',
  Scalar = 'Scalar',
  Union = 'Union',
  ExtendObject = 'ExtendObject',
  ExtendInputObject = 'ExtendInputObject',
  OutputField = 'OutputField',
  InputField = 'InputField',
  DynamicInput = 'DynamicInput',
  DynamicOutputMethod = 'DynamicOutputMethod',
  DynamicOutputProperty = 'DynamicOutputProperty',
  Plugin = 'Plugin',
  PrintedGenTyping = 'PrintedGenTyping',
  PrintedGenTypingImport = 'PrintedGenTypingImport',
}
export interface DeprecationInfo {
  /**
   * Reason for the deprecation.
   */
  reason: string
  /**
   * Date | YYYY-MM-DD formatted date of when this field
   * became deprecated.
   */
  startDate?: string | Date
  /**
   * Field or usage that replaces the deprecated field.
   */
  supersededBy?: string
}
export interface NonNullConfig {
  /**
   * Whether output fields are non-null by default.
   *
   * type Example {
   *   field: String!
   *   otherField: [String!]!
   * }
   *
   * @default true
   */
  output?: boolean
  /**
   * Whether input fields (field arguments, input type members)
   * are non-null by default.
   *
   * input Example {
   *   field: String
   *   something: [String]
   * }
   *
   * @default false
   */
  input?: boolean
}
export declare type GraphQLPossibleOutputs = GraphQLCompositeType | GraphQLLeafType
export declare type GraphQLPossibleInputs = GraphQLInputObjectType | GraphQLLeafType
export declare const NexusWrappedSymbol: unique symbol
export declare function withNexusSymbol(obj: Function, nexusType: NexusTypes): void
export interface AsyncIterator<T> {
  next(value?: any): Promise<IteratorResult<T>>
  return?(value?: any): Promise<IteratorResult<T>>
  throw?(e?: any): Promise<IteratorResult<T>>
}
export declare type RootTypingDef = string | RootTypingImport
export declare type RootTypings = Record<string, string | RootTypingImport>
export interface RootTypingImport {
  /**
   * File path to import the type from.
   */
  path: string
  /**
   * Name of the type we want to reference in the `path`
   */
  name: string
  /**
   * Name we want the imported type to be referenced as
   */
  alias?: string
}
export interface MissingType {
  fromObject: boolean
}
export declare type GraphQLNamedOutputType =
  | GraphQLScalarType
  | GraphQLObjectType
  | GraphQLInterfaceType
  | GraphQLUnionType
  | GraphQLEnumType
export declare type GraphQLNamedInputType = GraphQLScalarType | GraphQLInputObjectType | GraphQLEnumType
declare type WithExt<
  T extends {
    extensions?: any
  },
  Ext
> = Omit<T, 'extensions'> & {
  extensions?: Maybe<{
    nexus?: Ext
  }>
}
export declare type NexusGraphQLFieldConfig = WithExt<GraphQLFieldConfig<any, any>, NexusFieldExtension> & {
  name: string
}
export declare type NexusGraphQLObjectTypeConfig = WithExt<
  GraphQLObjectTypeConfig<any, any>,
  NexusObjectTypeExtension
>
export declare type NexusGraphQLInputObjectTypeConfig = WithExt<
  GraphQLInputObjectTypeConfig,
  NexusInputObjectTypeExtension
>
export declare type NexusGraphQLInterfaceTypeConfig = WithExt<
  GraphQLInterfaceTypeConfig<any, any>,
  NexusInterfaceTypeExtension
>
export declare type NexusGraphQLSchema = Omit<GraphQLSchema, 'extensions'> & {
  extensions: {
    nexus: NexusSchemaExtension
  }
}
export {}
