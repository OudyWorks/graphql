const {
  GraphQLObjectType,
  GraphQLList,
  GraphQLInt,
} = require('graphql'),
  key = require('./key'),
  plural = require('plural')

module.exports = function getListQueryConfig(Type, resolve, options = { fields: {}, args: {} }) {
  let pluralName = Type.pluralName || plural(Type.name)
  return {
    [key(pluralName)]: {
      type: new GraphQLObjectType({
        name: pluralName,
        fields: Object.assign(
          {
            list: {
              type: new GraphQLList(Type)
            },
            total: {
              type: GraphQLInt
            },
            page: {
              type: GraphQLInt
            },
            limit: {
              type: GraphQLInt
            }
          },
          options.fields || {}
        )
      }),
      args: Object.assign(
        {
          page: {
            type: GraphQLInt,
            defaultValue: 1
          },
          limit: {
            type: GraphQLInt,
            defaultValue: 20
          }
        },
        options.args || {}
      ),
      resolve
    }
  }
}