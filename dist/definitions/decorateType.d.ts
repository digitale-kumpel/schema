import { GraphQLNamedType } from 'graphql'
import { RootTypingDef } from './_types'
export interface TypeExtensionConfig {
  asNexusMethod?: string
  rootTyping?: RootTypingDef
}
export declare type NexusTypeExtensions = {
  nexus: TypeExtensionConfig
}
export declare function decorateType<T extends GraphQLNamedType>(type: T, config: TypeExtensionConfig): T
