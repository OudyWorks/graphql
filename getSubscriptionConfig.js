import {
  GraphQLID
} from 'graphql'
import {
  key
} from './key'
import {
  getMutationObjectType
} from './getMutationObjectType'

export function getSubscriptionConfig(Type, subscribe, options = { args: {} }, resolve = undefined) {
  return {
    [key(Type.name)]: {
      type: getMutationObjectType(Type),
      args: Object.assign(
        {
          id: {
            type: GraphQLID
          }
        },
        options.args || {}
      ),
      subscribe,
      resolve: resolve || function (source, args, context, info) {
        return source
      }
    }
  }
}