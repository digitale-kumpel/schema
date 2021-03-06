import {
  GraphQLScalarType,
  isEnumType,
  isInputObjectType,
  isInterfaceType,
  isListType,
  isNonNullType,
  isObjectType,
  isScalarType,
  isSpecifiedScalarType,
  isUnionType,
  isWrappingType,
  specifiedScalarTypes,
} from 'graphql'
import path from 'path'
import { decorateType } from './definitions/decorateType'
import { NexusTypes, withNexusSymbol } from './definitions/_types'
export const isInterfaceField = (type, fieldName) => {
  return type.getInterfaces().some((i) => Boolean(i.getFields()[fieldName]))
}
// ----------------------------
/**
 *
 * Copied from graphql-js:
 *
 */
/**
 * Given an invalid input string and a list of valid options, returns a filtered
 * list of valid options sorted based on their similarity with the input.
 */
export function suggestionList(input = '', options = []) {
  var optionsByDistance = Object.create(null)
  var oLength = options.length
  var inputThreshold = input.length / 2
  for (var i = 0; i < oLength; i++) {
    var distance = lexicalDistance(input, options[i])
    var threshold = Math.max(inputThreshold, options[i].length / 2, 1)
    if (distance <= threshold) {
      optionsByDistance[options[i]] = distance
    }
  }
  return Object.keys(optionsByDistance).sort(function (a, b) {
    return optionsByDistance[a] - optionsByDistance[b]
  })
}
/**
 * Computes the lexical distance between strings A and B.
 *
 * The "distance" between two strings is given by counting the minimum number
 * of edits needed to transform string A into string B. An edit can be an
 * insertion, deletion, or substitution of a single character, or a swap of two
 * adjacent characters.
 *
 * Includes a custom alteration from Damerau-Levenshtein to treat case changes
 * as a single edit which helps identify mis-cased values with an edit distance
 * of 1.
 *
 * This distance can be useful for detecting typos in input or sorting
 */
function lexicalDistance(aStr, bStr) {
  if (aStr === bStr) {
    return 0
  }
  let i
  let j
  const d = []
  const a = aStr.toLowerCase()
  const b = bStr.toLowerCase()
  const aLength = a.length
  const bLength = b.length // Any case change counts as a single edit
  if (a === b) {
    return 1
  }
  for (i = 0; i <= aLength; i++) {
    d[i] = [i]
  }
  for (j = 1; j <= bLength; j++) {
    d[0][j] = j
  }
  for (i = 1; i <= aLength; i++) {
    for (j = 1; j <= bLength; j++) {
      var cost = a[i - 1] === b[j - 1] ? 0 : 1
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cost)
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + cost)
      }
    }
  }
  return d[aLength][bLength]
}
// ----------------------------
export function objValues(obj) {
  return Object.keys(obj).reduce((result, key) => {
    result.push(obj[key])
    return result
  }, [])
}
export function mapObj(obj, mapper) {
  return Object.keys(obj).map((key, index) => mapper(obj[key], key, index))
}
export function mapValues(obj, mapper) {
  const result = {}
  Object.keys(obj).forEach((key, index) => (result[key] = mapper(obj[key], key, index)))
  return result
}
export function eachObj(obj, iter) {
  Object.keys(obj).forEach((name, i) => iter(obj[name], name, i))
}
export const isObject = (obj) => obj !== null && typeof obj === 'object'
export const assertAbsolutePath = (pathName, property) => {
  if (!path.isAbsolute(pathName)) {
    throw new Error(`Expected path for ${property} to be an absolute path, saw ${pathName}`)
  }
  return pathName
}
export function groupTypes(schema) {
  const groupedTypes = {
    input: [],
    interface: [],
    object: [],
    union: [],
    enum: [],
    scalar: Array.from(specifiedScalarTypes),
  }
  const schemaTypeMap = schema.getTypeMap()
  Object.keys(schemaTypeMap)
    .sort()
    .forEach((typeName) => {
      if (typeName.indexOf('__') === 0) {
        return
      }
      const type = schema.getType(typeName)
      if (isObjectType(type)) {
        groupedTypes.object.push(type)
      } else if (isInputObjectType(type)) {
        groupedTypes.input.push(type)
      } else if (isScalarType(type) && !isSpecifiedScalarType(type) && !isUnknownType(type)) {
        groupedTypes.scalar.push(type)
      } else if (isUnionType(type)) {
        groupedTypes.union.push(type)
      } else if (isInterfaceType(type)) {
        groupedTypes.interface.push(type)
      } else if (isEnumType(type)) {
        groupedTypes.enum.push(type)
      }
    })
  return groupedTypes
}
export function isUnknownType(type) {
  return type.name === UNKNOWN_TYPE_SCALAR.name
}
export function firstDefined(...args) {
  for (let i = 0; i < args.length; i++) {
    const arg = args[i]
    if (typeof arg !== 'undefined') {
      return arg
    }
  }
  /* istanbul ignore next */
  throw new Error('At least one of the values should be defined')
}
export function isPromiseLike(value) {
  return Boolean(value && typeof value.then === 'function')
}
export function relativePathTo(absolutePath, outputPath) {
  const filename = path.basename(absolutePath).replace(/(\.d)?\.ts/, '')
  const relative = path.relative(path.dirname(outputPath), path.dirname(absolutePath))
  if (relative.indexOf('.') !== 0) {
    return `./${path.join(relative, filename)}`
  }
  return path.join(relative, filename)
}
export class PrintedGenTypingImport {
  constructor(config) {
    this.config = config
  }
}
withNexusSymbol(PrintedGenTypingImport, NexusTypes.PrintedGenTypingImport)
export function printedGenTypingImport(config) {
  return new PrintedGenTypingImport(config)
}
export class PrintedGenTyping {
  constructor(config) {
    this.config = config
  }
  get imports() {
    return this.config.imports || []
  }
  toString() {
    let str = ``
    if (this.config.description) {
      const descriptionLines = this.config.description
        .split('\n')
        .map((s) => s.trim())
        .filter((s) => s)
        .map((s) => ` * ${s}`)
        .join('\n')
      str = `/**\n${descriptionLines}\n */\n`
    }
    const field = `${this.config.name}${this.config.optional ? '?' : ''}`
    str += `${field}: ${this.config.type}`
    return str
  }
}
withNexusSymbol(PrintedGenTyping, NexusTypes.PrintedGenTyping)
export function printedGenTyping(config) {
  return new PrintedGenTyping(config)
}
export function unwrapType(type) {
  let finalType = type
  let isNonNull = false
  const list = []
  while (isWrappingType(finalType)) {
    while (isListType(finalType)) {
      finalType = finalType.ofType
      if (isNonNullType(finalType)) {
        finalType = finalType.ofType
        list.unshift(true)
      } else {
        list.unshift(false)
      }
    }
    if (isNonNullType(finalType)) {
      isNonNull = true
      finalType = finalType.ofType
    }
  }
  return { type: finalType, isNonNull, list }
}
export function assertNoMissingTypes(schema, missingTypes) {
  const missingTypesNames = Object.keys(missingTypes)
  const schemaTypeMap = schema.getTypeMap()
  const schemaTypeNames = Object.keys(schemaTypeMap).filter(
    (typeName) => !isUnknownType(schemaTypeMap[typeName])
  )
  if (missingTypesNames.length > 0) {
    const errors = missingTypesNames
      .map((typeName) => {
        const { fromObject } = missingTypes[typeName]
        if (fromObject) {
          return `- Looks like you forgot to import ${typeName} in the root "types" passed to Nexus makeSchema`
        }
        const suggestions = suggestionList(typeName, schemaTypeNames)
        let suggestionsString = ''
        if (suggestions.length > 0) {
          suggestionsString = ` or mean ${suggestions.join(', ')}`
        }
        return `- Missing type ${typeName}, did you forget to import a type to the root query${suggestionsString}?`
      })
      .join('\n')
    throw new Error('\n' + errors)
  }
}
export function consoleWarn(msg) {
  console.warn(msg)
}
export function log(msg) {
  console.log(`Nexus Schema: ${msg}`)
}
/**
 * Calculate the venn diagram between two iterables based on reference equality
 * checks. The returned tripple contains items thusly:
 *
 *    * items only in arg 1 --> first tripple slot
 *    * items in args 1 & 2 --> second tripple slot
 *    * items only in arg 2 --> third tripple slot
 */
export function venn(xs, ys) {
  const lefts = new Set(xs)
  const boths = new Set()
  const rights = new Set(ys)
  lefts.forEach((l) => {
    if (rights.has(l)) {
      boths.add(l)
      lefts.delete(l)
      rights.delete(l)
    }
  })
  return [lefts, boths, rights]
}
/**
 * Validate that the data returned from a plugin from the `onInstall` hook is valid.
 */
export function validateOnInstallHookResult(pluginName, hookResult) {
  if (!Array.isArray(hookResult === null || hookResult === void 0 ? void 0 : hookResult.types)) {
    throw new Error(
      `Plugin "${pluginName}" returned invalid data for "onInstall" hook:\n\nexpected structure:\n\n  { types: NexusAcceptedTypeDef[] }\n\ngot:\n\n  ${hookResult}`
    )
  }
  // TODO we should validate that the array members all fall under NexusAcceptedTypeDef
}
export const UNKNOWN_TYPE_SCALAR = decorateType(
  new GraphQLScalarType({
    name: 'NEXUS__UNKNOWN__TYPE',
    description: `
    This scalar should never make it into production. It is used as a placeholder for situations
    where GraphQL Nexus encounters a missing type. We don't want to error immedately, otherwise
    the TypeScript definitions will not be updated.
  `,
    parseValue(value) {
      throw new Error('Error: NEXUS__UNKNOWN__TYPE is not a valid scalar.')
    },
    parseLiteral(value) {
      throw new Error('Error: NEXUS__UNKNOWN__TYPE is not a valid scalar.')
    },
    serialize(value) {
      throw new Error('Error: NEXUS__UNKNOWN__TYPE is not a valid scalar.')
    },
  }),
  {
    rootTyping: 'never',
  }
)
export function pathToArray(infoPath) {
  const flattened = []
  let curr = infoPath
  while (curr) {
    flattened.push(curr.key)
    curr = curr.prev
  }
  return flattened.reverse()
}
export function getOwnPackage() {
  return require('../package.json')
}
/**
 * Use this to make assertion at end of if-else chain that all members of a
 * union have been accounted for.
 */
export function casesHandled(x) {
  throw new Error(`A case was not handled for value: ${x}`)
}
//# sourceMappingURL=utils.js.map
