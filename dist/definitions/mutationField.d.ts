import { FieldOutConfig, OutputDefinitionBlock } from '../core'
import { NexusExtendTypeDef } from './extendType'
export declare type MutationFieldConfig<FieldName extends string> =
  | FieldOutConfig<'Mutation', FieldName>
  | (() => FieldOutConfig<'Mutation', FieldName>)
export declare function mutationField(
  fieldFn: (t: OutputDefinitionBlock<'Mutation'>) => void
): NexusExtendTypeDef<'Mutation'>
export declare function mutationField<FieldName extends string>(
  fieldName: FieldName,
  config: MutationFieldConfig<FieldName>
): NexusExtendTypeDef<'Mutation'>
