import {
  GraphQLObjectType,
  GraphQLList,
  GraphQLString
} from 'graphql'

const $type = Symbol('type')

export function getErrorObjectType(Type, moreFields = {}, deep = false) {

  if (!deep && Type[$type])
    return Type[$type]

  switch (Type.constructor.name) {

    case 'GraphQLObjectType':

      let _fields = Type.getFields()

      if (deep && _fields.id && !Type.entityLess)
        return GraphQLString

      return Type[$type] = Type[$type] || new GraphQLObjectType({
        name: `${Type.name}Error`,
        fields() {
          let fields = {}
          Object.keys(_fields).forEach(
            key =>
              fields[key] = {
                type: getErrorObjectType(_fields[key].type, moreFields[key] || {}, true)
              }
          )
          return Object.assign(
            fields,
            moreFields
          )
        }
      })

    case 'GraphQLScalarType':
    case 'GraphQLEnumType':
    case 'GraphQLUnionType':

      return GraphQLString

    case 'GraphQLList':

      return Type[$type] = new GraphQLList(
        getErrorObjectType(Type.ofType, moreFields, true)
      )

  }
}