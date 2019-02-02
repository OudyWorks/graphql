const {
  $type,
  $query,
  $listQuery,
  $mutation,
  $subscription
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
    console.log(User[$query]())
    console.log(User[$listQuery]())
    console.log(User[$mutation]())
    console.log(User[$subscription]())
    console.log(User[$type].pluralName)
  }
)