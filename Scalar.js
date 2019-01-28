const {
  GraphQLScalarType
} = require('graphql'),
  {
    Kind
  } = require('graphql/language')

function parseLiteral(ast) {
  switch (ast.kind) {
    case Kind.STRING:
    case Kind.BOOLEAN:
      return ast.value
    case Kind.INT:
    case Kind.FLOAT:
      return parseFloat(ast.value)
    case Kind.OBJECT: {
      const value = Object.create(null)
      ast.fields.forEach(
        field =>
          value[field.name.value] = parseLiteral(field.value)
      )
      return value
    }
    case Kind.LIST:
      return ast.values.map(parseLiteral)
    default:
      return null
  }
}

module.exports = new GraphQLScalarType({
  name: 'Scalar',
  serialize(value) {
    return value
  },
  parseValue(value) {
    return value
  },
  parseLiteral
})