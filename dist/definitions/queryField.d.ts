import { FieldOutConfig, OutputDefinitionBlock } from '../core'
import { NexusExtendTypeDef } from './extendType'
export declare type QueryFieldConfig<FieldName extends string> =
  | FieldOutConfig<'Query', FieldName>
  | (() => FieldOutConfig<'Query', FieldName>)
export declare function queryField(
  fieldFn: (t: OutputDefinitionBlock<'Query'>) => void
): NexusExtendTypeDef<'Query'>
export declare function queryField<FieldName extends string>(
  fieldName: FieldName,
  config: QueryFieldConfig<FieldName>
): NexusExtendTypeDef<'Query'>
