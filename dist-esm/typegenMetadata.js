import { __awaiter } from 'tslib'
import { lexicographicSortSchema, printSchema } from 'graphql'
import path from 'path'
import { SDL_HEADER, TYPEGEN_HEADER } from './lang'
import { typegenAutoConfig } from './typegenAutoConfig'
import { typegenFormatPrettier } from './typegenFormatPrettier'
import { TypegenPrinter } from './typegenPrinter'
/**
 * Passed into the SchemaBuilder, this keeps track of any necessary
 * field / type metadata we need to be aware of when building the
 * generated types and/or SDL artifact, including but not limited to:
 */
export class TypegenMetadata {
  constructor(config) {
    this.config = config
  }
  /**
   * Generates the artifacts of the build based on what we
   * know about the schema and how it was defined.
   */
  generateArtifacts(schema) {
    return __awaiter(this, void 0, void 0, function* () {
      const sortedSchema = this.sortSchema(schema)
      if (this.config.outputs.schema || this.config.outputs.typegen) {
        const { schemaTypes, tsTypes } = yield this.generateArtifactContents(
          sortedSchema,
          this.config.outputs.typegen
        )
        if (this.config.outputs.schema) {
          yield this.writeFile('schema', schemaTypes, this.config.outputs.schema)
        }
        if (this.config.outputs.typegen) {
          yield this.writeFile('types', tsTypes, this.config.outputs.typegen)
        }
      }
    })
  }
  generateArtifactContents(schema, typeFilePath) {
    return __awaiter(this, void 0, void 0, function* () {
      const [schemaTypes, tsTypes] = yield Promise.all([
        this.generateSchemaFile(schema),
        typeFilePath ? this.generateTypesFile(schema, typeFilePath) : '',
      ])
      return { schemaTypes, tsTypes }
    })
  }
  sortSchema(schema) {
    let sortedSchema = schema
    if (typeof lexicographicSortSchema !== 'undefined') {
      sortedSchema = lexicographicSortSchema(schema)
    }
    return sortedSchema
  }
  writeFile(type, output, filePath) {
    return __awaiter(this, void 0, void 0, function* () {
      if (typeof filePath !== 'string' || !path.isAbsolute(filePath)) {
        return Promise.reject(
          new Error(`Expected an absolute path to output the Nexus ${type}, saw ${filePath}`)
        )
      }
      const fs = require('fs')
      const util = require('util')
      const [readFile, writeFile, removeFile, mkdir] = [
        util.promisify(fs.readFile),
        util.promisify(fs.writeFile),
        util.promisify(fs.unlink),
        util.promisify(fs.mkdir),
      ]
      let formatTypegen = null
      if (typeof this.config.formatTypegen === 'function') {
        formatTypegen = this.config.formatTypegen
      } else if (this.config.prettierConfig) {
        formatTypegen = typegenFormatPrettier(this.config.prettierConfig)
      }
      const content = typeof formatTypegen === 'function' ? yield formatTypegen(output, type) : output
      const [toSave, existing] = yield Promise.all([content, readFile(filePath, 'utf8').catch(() => '')])
      if (toSave !== existing) {
        const dirPath = path.dirname(filePath)
        try {
          yield mkdir(dirPath, { recursive: true })
        } catch (e) {
          if (e.code !== 'EEXIST') {
            throw e
          }
        }
        // VSCode reacts to file changes better if a file is first deleted,
        // apparently. See issue motivating this logic here:
        // https://github.com/prisma-labs/nexus/issues/247.
        try {
          yield removeFile(filePath)
        } catch (e) {
          /* istanbul ignore next */
          if (e.code !== 'ENOENT' && e.code !== 'ENOTDIR') {
            throw e
          }
        }
        return writeFile(filePath, toSave)
      }
    })
  }
  /**
   * Generates the schema, adding any directives as necessary
   */
  generateSchemaFile(schema) {
    let printedSchema = this.config.customPrintSchemaFn
      ? this.config.customPrintSchemaFn(schema)
      : printSchema(schema)
    return [SDL_HEADER, printedSchema].join('\n\n')
  }
  /**
   * Generates the type definitions
   */
  generateTypesFile(schema, typegenFile) {
    return __awaiter(this, void 0, void 0, function* () {
      return new TypegenPrinter(
        schema,
        Object.assign(Object.assign({}, yield this.getTypegenInfo(schema)), { typegenFile })
      ).print()
    })
  }
  getTypegenInfo(schema) {
    return __awaiter(this, void 0, void 0, function* () {
      if (this.config.typegenConfig) {
        if (this.config.typegenAutoConfig) {
          console.warn(
            `Only one of typegenConfig and typegenAutoConfig should be specified, ignoring typegenConfig`
          )
        }
        return this.config.typegenConfig(schema, this.config.outputs.typegen || '')
      }
      if (this.config.typegenAutoConfig) {
        return typegenAutoConfig(this.config.typegenAutoConfig)(schema, this.config.outputs.typegen || '')
      }
      return {
        nexusSchemaImportId: this.config.nexusSchemaImportId,
        headers: [TYPEGEN_HEADER],
        imports: [],
        contextType: 'any',
        backingTypeMap: {},
      }
    })
  }
}
//# sourceMappingURL=typegenMetadata.js.map
