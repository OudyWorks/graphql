const {
  GraphQLNonNull,
  GraphQLID
} = require('graphql'),
  key = require('./key')

module.exports = function getQueryConfig(Type, resolve, options = { args: {} }) {
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