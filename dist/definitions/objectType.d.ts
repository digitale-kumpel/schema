import { FieldResolver, GetGen } from '../typegenTypeHelpers'
import { OutputDefinitionBlock, OutputDefinitionBuilder } from './definitionBlocks'
import { NexusInterfaceTypeDef } from './interfaceType'
import { NonNullConfig, Omit, RootTypingDef } from './_types'
export declare type Implemented = GetGen<'interfaceNames'> | NexusInterfaceTypeDef<any>
export interface FieldModification<TypeName extends string, FieldName extends string> {
  /**
   * The description to annotate the GraphQL SDL
   */
  description?: string | null
  /**
   * The resolve method we should be resolving the field with
   */
  resolve?: FieldResolver<TypeName, FieldName>
}
export interface FieldModificationDef<TypeName extends string, FieldName extends string>
  extends FieldModification<TypeName, FieldName> {
  field: FieldName
}
export interface ObjectDefinitionBuilder<TypeName extends string> extends OutputDefinitionBuilder {
  addInterfaces(toAdd: Implemented[]): void
}
export declare class ObjectDefinitionBlock<TypeName extends string> extends OutputDefinitionBlock<TypeName> {
  protected typeBuilder: ObjectDefinitionBuilder<TypeName>
  constructor(typeBuilder: ObjectDefinitionBuilder<TypeName>)
  /**
   * @param interfaceName
   */
  implements(...interfaceName: Array<Implemented>): void
  /**
   * Modifies a field added via an interface
   */
  modify(field: any, modifications: any): void
}
export declare type NexusObjectTypeConfig<TypeName extends string> = {
  name: TypeName
  definition(t: ObjectDefinitionBlock<TypeName>): void
  /**
   * Configures the nullability for the type, check the
   * documentation's "Getting Started" section to learn
   * more about GraphQL Nexus's assumptions and configuration
   * on nullability.
   */
  nonNullDefaults?: NonNullConfig
  /**
   * The description to annotate the GraphQL SDL
   */
  description?: string | null
  /**
   * Root type information for this type
   */
  rootTyping?: RootTypingDef
} & NexusGenPluginTypeConfig<TypeName>
export declare class NexusObjectTypeDef<TypeName extends string> {
  readonly name: TypeName
  protected config: NexusObjectTypeConfig<TypeName>
  constructor(name: TypeName, config: NexusObjectTypeConfig<TypeName>)
  get value(): NexusObjectTypeConfig<TypeName>
}
export declare function objectType<TypeName extends string>(
  config: NexusObjectTypeConfig<TypeName>
): NexusObjectTypeDef<TypeName>
export declare function queryType(
  config: Omit<NexusObjectTypeConfig<'Query'>, 'name'>
): NexusObjectTypeDef<'Query'>
export declare function mutationType(
  config: Omit<NexusObjectTypeConfig<'Mutation'>, 'name'>
): NexusObjectTypeDef<'Mutation'>
