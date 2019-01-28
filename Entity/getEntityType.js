const {
    $type
  } = require('@oudy/entity')

module.exports = function getEntityType(Type) {

  if (Type[$type])
    return Type[$type]

  let fields = Type.getFields(),
    type = {}

  Object.keys(fields).forEach(
    key => {

      switch (fields[key].type.constructor.name) {

        case 'GraphQLScalarType':

          switch (fields[key].type.name) {

            case 'ID':
            case 'String':
              type[key] = String
              break

            case 'Int':
            case 'Float':
              type[key] = Number
              break


            case 'Boolean':
              type[key] = Boolean
              break

            default:
              type[key] = fields[key].entityType || String
              break

          }

          break

        case 'GraphQLList':
          type[key] = Array
          break

        case 'GraphQLObjectType':

          let _type = fields[key].type,
            _fields = _type.getFields()

          if (_fields.id && !_type.entityLess)
            type[key] = String

          else
            type[key] = getEntityType(_type)

          break

        default:
          type[key] = String
          break

      }

    }
  )

  return Type[$type] = type

}