import { GraphQLScalarType, GraphQLScalarTypeConfig } from 'graphql'
import { RootTypingDef } from './_types'
export interface ScalarBase
  extends Pick<
    GraphQLScalarTypeConfig<any, any>,
    'description' | 'serialize' | 'parseValue' | 'parseLiteral'
  > {}
export interface ScalarConfig {
  /**
   * Any deprecation info for this scalar type
   */
  deprecation?: string
  /**
   * Adds this type as a method on the Object/Interface definition blocks
   */
  asNexusMethod?: string
  /**
   * Root type information for this type
   */
  rootTyping?: RootTypingDef
}
export interface NexusScalarTypeConfig<T extends string> extends ScalarBase, ScalarConfig {
  /**
   * The name of the scalar type
   */
  name: T
}
export declare class NexusScalarTypeDef<TypeName extends string> {
  readonly name: TypeName
  protected config: NexusScalarTypeConfig<string>
  constructor(name: TypeName, config: NexusScalarTypeConfig<string>)
  get value(): NexusScalarTypeConfig<string>
}
export declare type NexusScalarExtensions = {
  nexus: {
    asNexusMethod?: string
    rootTyping?: RootTypingDef
  }
}
export declare function scalarType<TypeName extends string>(
  options: NexusScalarTypeConfig<TypeName>
): NexusScalarTypeDef<TypeName>
export declare function asNexusMethod<T extends GraphQLScalarType>(
  scalar: T,
  methodName: string,
  rootTyping?: RootTypingDef
): T
