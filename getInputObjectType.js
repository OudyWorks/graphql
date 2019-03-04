const $type = Symbol('type'),
  {
    GraphQLInputObjectType,
    GraphQLList,
    GraphQLID
  } = require('graphql'),
  Scalar = require('./Scalar')

module.exports = function getInputObjectType(Type, deep = false) {

  if (!deep && Type[$type])
    return Type[$type]

  switch (Type.constructor.name) {

    case 'GraphQLObjectType':

      let _fields = Type.getFields()

      if (deep && _fields.id && !Type.entityLess)
        return GraphQLID

      return Type[$type] = Type[$type] || new GraphQLInputObjectType({
        name: `${Type.name}Input`,
        fields() {
          let fields = {}
          Object.keys(_fields).forEach(
            key =>
              fields[key] = {
                type: getInputObjectType(_fields[key].type, true),
                defaultValue: _fields[key].defaultValue
              }
          )
          return fields
        }
      })

    case 'GraphQLScalarType':
    case 'GraphQLEnumType':

      return Type

    case 'GraphQLUnionType':

      return Scalar

    case 'GraphQLList':

      return Type[$type] = new GraphQLList(
        getInputObjectType(Type.ofType, true)
      )

  }
}