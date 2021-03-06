import { __rest } from 'tslib'
import { assertAbsolutePath, getOwnPackage } from './utils'
/**
 * Normalizes the builder config into the config we need for typegen
 *
 * @param config {BuilderConfig}
 */
export function resolveTypegenConfig(config) {
  const {
      outputs,
      shouldGenerateArtifacts = Boolean(!process.env.NODE_ENV || process.env.NODE_ENV === 'development'),
    } = config,
    rest = __rest(config, ['outputs', 'shouldGenerateArtifacts'])
  let typegenPath = false
  let schemaPath = false
  if (outputs && typeof outputs === 'object') {
    if (typeof outputs.schema === 'string') {
      schemaPath = assertAbsolutePath(outputs.schema, 'outputs.schema')
    }
    if (typeof outputs.typegen === 'string') {
      typegenPath = assertAbsolutePath(outputs.typegen, 'outputs.typegen')
    }
  } else if (outputs !== false) {
    console.warn(
      `You should specify a configuration value for outputs in Nexus' makeSchema. ` +
        `Provide one to remove this warning.`
    )
  }
  return Object.assign(Object.assign({}, rest), {
    nexusSchemaImportId: getOwnPackage().name,
    outputs: {
      typegen: shouldGenerateArtifacts ? typegenPath : false,
      schema: shouldGenerateArtifacts ? schemaPath : false,
    },
  })
}
//# sourceMappingURL=typegenUtils.js.map
