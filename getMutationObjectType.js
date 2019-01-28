const {
  GraphQLObjectType,
  GraphQLList,
  GraphQLString,
  GraphQLBoolean
} = require('graphql'),
  key = require('./key'),
  getErrorObjectType = require('./getErrorObjectType'),
  $type = Symbol('type')

module.exports = function getMutationType(Type, options = { fields: {}, errorFields: {} }) {
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