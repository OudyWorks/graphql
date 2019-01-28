const {
  GraphQLNonNull,
  GraphQLID
} = require('graphql'),
  getMutationObjectType = require('./getMutationObjectType'),
  getInputObjectType = require('./getInputObjectType'),
  key = require('./key')

module.exports = function getMutationConfig(Type, resolve, options = { fields: {}, args: {}, errorFields: {} }) {
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