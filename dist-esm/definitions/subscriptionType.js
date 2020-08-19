import { ObjectDefinitionBlock, objectType } from './objectType'
export class SubscriptionDefinitionBlock extends ObjectDefinitionBlock {
  constructor(typeBuilder, isList = false) {
    super(typeBuilder)
    this.typeBuilder = typeBuilder
    this.isList = isList
  }
  get list() {
    if (this.isList) {
      throw new Error('Cannot chain list.list, in the definition block. Use `list: []` config value')
    }
    return new SubscriptionDefinitionBlock(this.typeBuilder, true)
  }
  string(fieldName, ...opts) {
    this.addScalarField(fieldName, 'String', opts)
  }
  int(fieldName, ...opts) {
    this.addScalarField(fieldName, 'Int', opts)
  }
  boolean(fieldName, ...opts) {
    this.addScalarField(fieldName, 'Boolean', opts)
  }
  id(fieldName, ...opts) {
    this.addScalarField(fieldName, 'ID', opts)
  }
  float(fieldName, ...opts) {
    this.addScalarField(fieldName, 'Float', opts)
  }
  field(name, fieldConfig) {
    const field = Object.assign({ name }, fieldConfig)
    this.typeBuilder.addField(this.decorateField(field))
  }
}
export function subscriptionType(config) {
  return objectType(Object.assign({ name: 'Subscription' }, config))
}
//# sourceMappingURL=subscriptionType.js.map
