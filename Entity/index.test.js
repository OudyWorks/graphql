const {
  $type,
  $input,
  $error
} = Entity = require('./index'),
{
  GraphQLObjectType,
  GraphQLID,
  GraphQLString,
  GraphQLBoolean,
  GraphQLInt,
  Scalar
} = require('@oudy/graphql')

test(
  'Global Events',
  () => {
    class User extends Entity {

    }
    User[$type] = new GraphQLObjectType({
      name: 'User',
      fields() {
        return {
          id: {
            type: GraphQLID
          },
          name: {
            type: GraphQLString
          }
        }
      }
    })
    User.on(
      'test',
      (value) => {
        expect(value).toBe(true)
      }
    )
    User.emit('test', true)
    console.log(User[$error]().getFields())
    console.log(User[$input]().getFields())
    console.log(User[$type].pluralName)
  }
)