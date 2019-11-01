import {
  GraphQLNonNull,
  GraphQLID
} from 'graphql'
import {
  getMutationObjectType
} from './getMutationObjectType'
import {
  getInputObjectType
} from './getInputObjectType'
import {
  key
} from './key'

export function getMutationConfig(Type, resolve, options = { fields: {}, args: {}, errorFields: {} }) {
  return {
    [key(Type.name)]: {
      type: getMutationObjectType(Type, options),
      args: Object.assign(
        {
          [key(Type.name)]: {
            type: new GraphQLNonNull(
              getInputObjectType(Type)
            )
          },
          id: {
            type: GraphQLID,
            defaultValue: ''
          }
        },
        options.args || {}
      ),
      resolve
    }
  }
}