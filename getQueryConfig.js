import {
  GraphQLNonNull,
  GraphQLID
} from 'graphql'
import {
  key
} from './key'

export function getQueryConfig(Type, resolve, options = { args: {} }) {
  return {
    [key(Type.name)]: {
      type: Type,
      args: Object.assign(
        {
          id: {
            type: new GraphQLNonNull(GraphQLID)
          }
        },
        options.args || {}
      ),
      resolve
    }
  }
}