import { GraphQLFieldResolver, GraphQLResolveInfo } from 'graphql'
import { ArgsRecord } from '../definitions/args'
import { FieldOutConfig } from '../definitions/definitionBlocks'
import { ObjectDefinitionBlock } from '../definitions/objectType'
import { AllNexusOutputTypeDefs } from '../definitions/wrapping'
import {
  ArgsValue,
  GetGen,
  MaybePromise,
  MaybePromiseDeep,
  ResultValue,
  RootValue,
} from '../typegenTypeHelpers'
export interface ConnectionPluginConfig {
  /**
   * The method name in the objectType definition block
   *
   * @default 'connectionField'
   */
  nexusFieldName?: string
  /**
   * Whether to expose the "nodes" directly on the connection for convenience.
   *
   * @default false
   */
  includeNodesField?: boolean
  /**
   * Any args to include by default on all connection fields,
   * in addition to the ones in the spec.
   *
   * @default null
   */
  additionalArgs?: ArgsRecord
  /**
   * Set to true to disable forward pagination.
   *
   * @default false
   */
  disableForwardPagination?: boolean
  /**
   * Set to true to disable backward pagination.
   *
   * @default false
   */
  disableBackwardPagination?: boolean
  /**
   * Custom logic to validate the arguments.
   *
   * Defaults to requiring that either a `first` or `last` is provided, and
   * that after / before must be paired with `first` or `last`, respectively.
   */
  validateArgs?: (args: Record<string, any>, info: GraphQLResolveInfo) => void
  /**
   * If disableForwardPagination or disableBackwardPagination are set to true,
   * we require the `first` or `last` field as needed. Defaults to true,
   * setting this to false will disable this behavior and make the field nullable.
   */
  strictArgs?: boolean
  /**
   * Default approach we use to transform a node into an unencoded cursor.
   *
   * Default is `cursor:${index}`
   *
   * @default "field"
   */
  cursorFromNode?: (
    node: any,
    args: PaginationArgs,
    ctx: GetGen<'context'>,
    info: GraphQLResolveInfo,
    forCursor: {
      index: number
      nodes: any[]
    }
  ) => string | Promise<string>
  /**
   * Override the default behavior of determining hasNextPage / hasPreviousPage. Usually needed
   * when customizing the behavior of `cursorFromNode`
   */
  pageInfoFromNodes?: (
    allNodes: any[],
    args: PaginationArgs,
    ctx: GetGen<'context'>,
    info: GraphQLResolveInfo
  ) => {
    hasNextPage: boolean
    hasPreviousPage: boolean
  }
  /**
   * Conversion from a cursor string into an opaque token. Defaults to base64Encode(string)
   */
  encodeCursor?: (value: string) => string
  /**
   * Conversion from an opaque token into a cursor string. Defaults to base64Decode(string)
   */
  decodeCursor?: (cursor: string) => string
  /**
   * Extend *all* edges to include additional fields, beyond cursor and node
   */
  extendEdge?: Record<string, Omit<FieldOutConfig<any, any>, 'resolve'>>
  /**
   * Any additional fields to make available to the connection type,
   * beyond edges, pageInfo
   */
  extendConnection?: Record<string, Omit<FieldOutConfig<any, any>, 'resolve'>>
  /**
   * Prefix for the Connection / Edge type
   */
  typePrefix?: string
  /**
   * The path to the @nexus/schema package. Needed for typegen.
   *
   * @default '@nexus/schema'
   *
   * @remarks
   *
   * This setting is particularly useful when @nexus/schema is being wrapped by
   * another library/framework such that @nexus/schema is not expected to be a
   * direct dependency at the application level.
   */
  nexusSchemaImportId?: string
}
export declare type NodeValue<TypeName extends string = any, FieldName extends string = any> = Exclude<
  Exclude<Exclude<ResultValue<TypeName, FieldName>, null | undefined>['edges'], null | undefined>[number],
  null | undefined
>['node']
export declare type ConnectionFieldConfig<TypeName extends string = any, FieldName extends string = any> = {
  type: GetGen<'allOutputTypes', string> | AllNexusOutputTypeDefs
  /**
   * Additional args to use for just this field
   */
  additionalArgs?: ArgsRecord
  /**
   * Whether to inherit "additional args" if they exist on the plugin definition
   *
   * @default false
   */
  inheritAdditionalArgs?: boolean
  /**
   * Approach we use to transform a node into a cursor.
   *
   * @default "nodeField"
   */
  cursorFromNode?: (
    node: NodeValue<TypeName, FieldName>,
    args: ArgsValue<TypeName, FieldName>,
    ctx: GetGen<'context'>,
    info: GraphQLResolveInfo,
    forCursor: {
      index: number
      nodes: NodeValue<TypeName, FieldName>[]
    }
  ) => string | Promise<string>
  /**
   * Override the default behavior of determining hasNextPage / hasPreviousPage. Usually needed
   * when customizing the behavior of `cursorFromNode`
   */
  pageInfoFromNodes?: (
    nodes: NodeValue<TypeName, FieldName>[],
    args: ArgsValue<TypeName, FieldName>,
    ctx: GetGen<'context'>,
    info: GraphQLResolveInfo
  ) => {
    hasNextPage: boolean
    hasPreviousPage: boolean
  }
  /**
   * Whether the field allows for backward pagination
   */
  disableForwardPagination?: boolean
  /**
   * Whether the field allows for backward pagination
   */
  disableBackwardPagination?: boolean
  /**
   * If disableForwardPagination or disableBackwardPagination are set to true,
   * we require the `first` or `last` field as needed. Defaults to true,
   * setting this to false will disable this behavior and make the field nullable.
   */
  strictArgs?: boolean
  /**
   * Custom logic to validate the arguments.
   *
   * Defaults to requiring that either a `first` or `last` is provided, and
   * that after / before must be paired with `first` or `last`, respectively.
   */
  validateArgs?: (args: Record<string, any>, info: GraphQLResolveInfo) => void
  /**
   * Dynamically adds additional fields to the current "connection" when it is defined.
   * This will cause the resulting type to be prefix'ed with the name of the type/field it is branched off of,
   * so as not to conflict with any non-extended connections.
   */
  extendConnection?: (def: ObjectDefinitionBlock<any>) => void
  /**
   * Dynamically adds additional fields to the connection "edge" when it is defined.
   * This will cause the resulting type to be prefix'ed with the name of the type/field it is branched off of,
   * so as not to conflict with any non-extended connections.
   */
  extendEdge?: (def: ObjectDefinitionBlock<any>) => void
} & (
  | {
      /**
       * Nodes should resolve to an Array, with a length of one greater than the direction you
       * are paginating.
       *
       * For example, if you're paginating forward, and assuming an Array with length 20:
       *
       * (first: 2) - [{id: 1}, {id: 2}, {id: 3}] - note: {id: 3} is extra
       *
       * (last: 2) - [{id: 18}, {id: 19}, {id: 20}] - note {id: 18} is extra
       *
       * We will then slice the array in the direction we're iterating, and if there are more
       * than "N" results, we will assume there's a next page. If you set `assumeExactNodeCount: true`
       * in the config, we will assume that a next page exists if the length >= the node count.
       */
      nodes: (
        root: RootValue<TypeName>,
        args: ArgsValue<TypeName, FieldName>,
        ctx: GetGen<'context'>,
        info: GraphQLResolveInfo
      ) => MaybePromise<Array<NodeValue<TypeName, FieldName>>>
      resolve?: never
    }
  | {
      /**
       * Implement the full resolve, including `edges` and `pageInfo`. Useful for more complex
       * pagination cases, where you may want to use utilities from other libraries like
       * GraphQL Relay JS, and only use Nexus for the construction and type-safety:
       *
       * https://github.com/graphql/graphql-relay-js
       */
      resolve: (
        root: RootValue<TypeName>,
        args: ArgsValue<TypeName, FieldName>,
        ctx: GetGen<'context'>,
        info: GraphQLResolveInfo
      ) => MaybePromise<ResultValue<TypeName, FieldName>> | MaybePromiseDeep<ResultValue<TypeName, FieldName>>
      nodes?: never
    }
) &
  NexusGenPluginFieldConfig<TypeName, FieldName>
export declare type EdgeFieldResolver<
  TypeName extends string,
  FieldName extends string,
  EdgeField extends string
> = (
  root: RootValue<TypeName>,
  args: ArgsValue<TypeName, FieldName>,
  context: GetGen<'context'>,
  info: GraphQLResolveInfo
) => MaybePromise<ResultValue<TypeName, FieldName>['edges'][EdgeField]>
export declare type ConnectionNodesResolver<TypeName extends string, FieldName extends string> = (
  root: RootValue<TypeName>,
  args: ArgsValue<TypeName, FieldName>,
  context: GetGen<'context'>,
  info: GraphQLResolveInfo
) => MaybePromise<Array<NodeValue<TypeName, FieldName>>>
export declare type PageInfoFieldResolver<
  TypeName extends string,
  FieldName extends string,
  EdgeField extends string
> = (
  root: RootValue<TypeName>,
  args: ArgsValue<TypeName, FieldName>,
  context: GetGen<'context'>,
  info: GraphQLResolveInfo
) => MaybePromise<ResultValue<TypeName, FieldName>['pageInfo'][EdgeField]>
export declare const connectionPlugin: {
  (connectionPluginConfig?: ConnectionPluginConfig | undefined): import('../plugin').NexusPlugin
  defaultCursorFromNode: typeof defaultCursorFromNode
  defaultValidateArgs: typeof defaultValidateArgs
  defaultHasPreviousPage: typeof defaultHasPreviousPage
  defaultHasNextPage: typeof defaultHasNextPage
}
export declare function makeResolveFn(
  pluginConfig: ConnectionPluginConfig,
  fieldConfig: ConnectionFieldConfig
): GraphQLFieldResolver<any, any, any>
export declare type PaginationArgs = {
  first?: number | null
  after?: string | null
  last?: number | null
  before?: string | null
}
declare function defaultHasNextPage(nodes: any[], args: PaginationArgs): boolean
/**
 * A sensible default for determining "previous page".
 */
declare function defaultHasPreviousPage(nodes: any[], args: PaginationArgs): boolean
declare function defaultCursorFromNode(
  node: any,
  args: PaginationArgs,
  ctx: any,
  info: GraphQLResolveInfo,
  {
    index,
  }: {
    index: number
    nodes: any[]
  }
): string
declare function defaultValidateArgs(args: Record<string, any> | undefined, info: GraphQLResolveInfo): void
export {}
