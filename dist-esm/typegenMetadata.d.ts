import { GraphQLSchema } from 'graphql'
import { BuilderConfig, TypegenInfo } from './builder'
import { NexusGraphQLSchema } from './definitions/_types'
export interface TypegenMetadataConfig extends Omit<BuilderConfig, 'outputs' | 'shouldGenerateArtifacts'> {
  nexusSchemaImportId?: string
  outputs: {
    schema: false | string
    typegen: false | string
  }
}
/**
 * Passed into the SchemaBuilder, this keeps track of any necessary
 * field / type metadata we need to be aware of when building the
 * generated types and/or SDL artifact, including but not limited to:
 */
export declare class TypegenMetadata {
  protected config: TypegenMetadataConfig
  constructor(config: TypegenMetadataConfig)
  /**
   * Generates the artifacts of the build based on what we
   * know about the schema and how it was defined.
   */
  generateArtifacts(schema: NexusGraphQLSchema): Promise<void>
  generateArtifactContents(
    schema: NexusGraphQLSchema,
    typeFilePath: string | false
  ): Promise<{
    schemaTypes: string
    tsTypes: string
  }>
  sortSchema(schema: NexusGraphQLSchema): NexusGraphQLSchema
  writeFile(type: 'schema' | 'types', output: string, filePath: string): Promise<void>
  /**
   * Generates the schema, adding any directives as necessary
   */
  generateSchemaFile(schema: GraphQLSchema): string
  /**
   * Generates the type definitions
   */
  generateTypesFile(schema: NexusGraphQLSchema, typegenFile: string): Promise<string>
  getTypegenInfo(schema: GraphQLSchema): Promise<TypegenInfo>
}
