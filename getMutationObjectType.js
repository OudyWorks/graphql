import {
  GraphQLObjectType,
  GraphQLList,
  GraphQLString,
  GraphQLBoolean
} from 'graphql'
import {
  key
} from './key'
import {
  getErrorObjectType
} from './getErrorObjectType'

const $type = Symbol('type')

export function getMutationObjectType(Type, options = { fields: {}, errorFields: {} }) {
  return Type[$type] || (Type[$type] = new GraphQLObjectType({
    name: `${Type.name}Mutation`,
    fields: Object.assign(
      {
        [key(Type.name)]: {
          type: Type
        },
        erred: {
          type: GraphQLBoolean
        },
        errors: {
          type: getErrorObjectType(Type, options.errorFields || {})
        },
        changed: {
          type: GraphQLBoolean
        },
        changes: {
          type: new GraphQLList(GraphQLString)
        }
      },
      options.fields || {}
    )
  }))
}