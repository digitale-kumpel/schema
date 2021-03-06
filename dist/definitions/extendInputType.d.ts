import { GetGen } from '../typegenTypeHelpers'
import { InputDefinitionBlock } from './definitionBlocks'
export interface NexusExtendInputTypeConfig<TypeName extends string> {
  type: TypeName
  definition(t: InputDefinitionBlock<TypeName>): void
}
export declare class NexusExtendInputTypeDef<TypeName extends string> {
  readonly name: TypeName
  protected config: NexusExtendInputTypeConfig<string> & {
    name: string
  }
  constructor(
    name: TypeName,
    config: NexusExtendInputTypeConfig<string> & {
      name: string
    }
  )
  get value(): NexusExtendInputTypeConfig<string> & {
    name: string
  }
}
/**
 * Adds new fields to an existing inputObjectType in the schema. Useful when
 * splitting your schema across several domains.
 *
 * @see http://graphql-nexus.com/api/extendType
 */
export declare function extendInputType<TypeName extends GetGen<'inputNames', string>>(
  config: NexusExtendInputTypeConfig<TypeName>
): NexusExtendInputTypeDef<TypeName>
