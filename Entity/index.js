const {
  $pluralName
} = Entity = require('@oudy/entity'),
  getEntityType = require('./getEntityType'),
  $type = Symbol('type'),
  $input = Symbol('input'),
  $error = Symbol('error'),
  $bindContext = Symbol('bindContext'),
  $query = Symbol('query'),
  $listQuery = Symbol('listQuery'),
  $mutation = Symbol('mutation'),
  $subscription = Symbol('subscription'),
  $entity = Symbol('entity'),
  {
    key,
    GraphQLList,
    getInputObjectType,
    getErrorObjectType
  } = require('@oudy/graphql')

class GraphQLEntity extends Entity {
  static use(Entity) {

    const GraphQLEntity = class extends Entity {
      static get config() {
        return this.configFor(key(this[$type].name))
      }
      static get configMany() {
        return this.configManyFor(key(this[$pluralName]()))
      }
      static configFor(key) {
        return {
          type: this[$type],
          resolve: (source, args, context) =>
            this.load(source[key], context)
        }
      }
      static configManyFor(key) {
        return {
          type: new GraphQLList(this[$type]),
          resolve: (source, args, context) =>
            this.loadMany(source[key], context)
        }
      }
    }

    GraphQLEntity.__defineSetter__(
      $type,
      function (type) {
        this[Entity.$type] = getEntityType(type)
        type.pluralName = this[$pluralName]()
        this._type = type
      }
    )

    GraphQLEntity.__defineGetter__(
      $type,
      function (type) {
        return this._type
      }
    )

    GraphQLEntity[$input] = function () {
      return getInputObjectType(this[$type])
    }

    GraphQLEntity[$error] = function () {
      return getErrorObjectType(this[$type])
    }

    return GraphQLEntity

  }
}

module.exports = GraphQLEntity.use(Entity)

Object.assign(
  module.exports,
  {
    $type,
    $input,
    $error
  }
)