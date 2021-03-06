'use strict'
Object.defineProperty(exports, '__esModule', { value: true })
exports.resolveTypegenConfig = void 0
const tslib_1 = require('tslib')
const utils_1 = require('./utils')
/**
 * Normalizes the builder config into the config we need for typegen
 *
 * @param config {BuilderConfig}
 */
function resolveTypegenConfig(config) {
  const {
      outputs,
      shouldGenerateArtifacts = Boolean(!process.env.NODE_ENV || process.env.NODE_ENV === 'development'),
    } = config,
    rest = tslib_1.__rest(config, ['outputs', 'shouldGenerateArtifacts'])
  let typegenPath = false
  let schemaPath = false
  if (outputs && typeof outputs === 'object') {
    if (typeof outputs.schema === 'string') {
      schemaPath = utils_1.assertAbsolutePath(outputs.schema, 'outputs.schema')
    }
    if (typeof outputs.typegen === 'string') {
      typegenPath = utils_1.assertAbsolutePath(outputs.typegen, 'outputs.typegen')
    }
  } else if (outputs !== false) {
    console.warn(
      `You should specify a configuration value for outputs in Nexus' makeSchema. ` +
        `Provide one to remove this warning.`
    )
  }
  return Object.assign(Object.assign({}, rest), {
    nexusSchemaImportId: utils_1.getOwnPackage().name,
    outputs: {
      typegen: shouldGenerateArtifacts ? typegenPath : false,
      schema: shouldGenerateArtifacts ? schemaPath : false,
    },
  })
}
exports.resolveTypegenConfig = resolveTypegenConfig
//# sourceMappingURL=typegenUtils.js.map
