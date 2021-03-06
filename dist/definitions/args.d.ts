import { AllInputTypes, GetGen2 } from '../typegenTypeHelpers'
import { AllNexusInputTypeDefs } from './wrapping'
export declare type ArgsRecord = Record<
  string,
  NexusArgDef<AllInputTypes> | AllInputTypes | AllNexusInputTypeDefs<string>
>
export interface CommonArgConfig {
  /**
   * Whether the field is required, `required: true` = `nullable: false`
   */
  required?: boolean
  /**
   * Whether the field is nullable, `nullable: true` = `required: false`
   */
  nullable?: boolean
  /**
   * Whether the argument is a list or not.
   *
   * null = not a list
   * true = list
   * array = nested list, where true/false decides
   * whether the list member can be nullable
   */
  list?: null | true | boolean[]
  /**
   * The description to annotate the GraphQL SDL
   */
  description?: string | null
}
export interface ScalarArgConfig<T> extends CommonArgConfig {
  /**
   * Configure the default for the object
   */
  default?: T
}
export declare type NexusArgConfigType<T extends AllInputTypes> = T | AllNexusInputTypeDefs<T>
export interface NexusAsArgConfig<T extends AllInputTypes> extends CommonArgConfig {
  /**
   * Configure the default for the object
   */
  default?: GetGen2<'allTypes', T>
}
export interface NexusArgConfig<T extends AllInputTypes> extends NexusAsArgConfig<T> {
  /**
   * The type of the argument, either the string name of the type,
   * or the concrete Nexus type definition
   */
  type: NexusArgConfigType<T>
}
export declare class NexusArgDef<TypeName extends AllInputTypes> {
  readonly name: string
  protected config: NexusArgConfig<TypeName>
  constructor(name: string, config: NexusArgConfig<TypeName>)
  get value(): NexusArgConfig<TypeName>
}
/**
 * Defines an argument that can be used in any object or interface type
 *
 * Takes the GraphQL type name and any options.
 *
 * The value returned from this argument can be used multiple times in any valid `args` object value
 *
 * @see https://graphql.github.io/learn/schema/#arguments
 */
export declare function arg<T extends AllInputTypes>(
  options: {
    type: NexusArgConfigType<T>
  } & NexusArgConfig<T>
): NexusArgDef<T>
export declare function stringArg(options?: ScalarArgConfig<string>): NexusArgDef<'String'>
export declare function intArg(options?: ScalarArgConfig<number>): NexusArgDef<'Int'>
export declare function floatArg(options?: ScalarArgConfig<number>): NexusArgDef<'Float'>
export declare function idArg(options?: ScalarArgConfig<string>): NexusArgDef<'ID'>
export declare function booleanArg(options?: ScalarArgConfig<boolean>): NexusArgDef<'Boolean'>
