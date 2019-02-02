const {
  $pluralName,
  $validateContext,
  $context
} = Entity = require('@oudy/entity'),
  getEntityType = require('./getEntityType'),
  $type = Symbol('type'),
  $bindContext = Symbol('bindContext'),
  $boundedContext = Symbol('boundedContext'),
  $query = Symbol('query'),
  $listQuery = Symbol('listQuery'),
  $mutation = Symbol('mutation'),
  $subscription = Symbol('subscription'),
  $entity = Symbol('entity'),
  $pubsub = Symbol('pubsub'),
  {
    key,
    GraphQLList,
    getQueryConfig,
    getListQueryConfig,
    getMutationConfig,
    getSubscriptionConfig
  } = require('@oudy/graphql'),
  {
    withFilter
  } = require('graphql-subscriptions')

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
            this[$bindContext](args, context).then(
              () =>
                this.load(source[key], context)
            )
        }
      }
      static configManyFor(key) {
        return {
          type: new GraphQLList(this[$type]),
          resolve: (source, args, context) =>
            this[$bindContext](args, context).then(
              () =>
                this.loadMany(source[key], context)
            )
        }
      }

      save(bind) {
        return super.save(bind).then(
          id => {
            if (this.constructor[$pubsub] && bind && bind.changed && !bind.erred) {
              const name = key(this.constructor.name)
              this.constructor[$pubsub].publish(
                name,
                {
                  [name]: this,
                  ...bind
                }
              )
            }

            return id
          }
        )
      }

      static [$query](resolve, options = { args: {} }) {
        // Todo use resolve
        return getQueryConfig(
          this[$type],
          (source, args, context, info) =>
            this[$bindContext](args, context).then(
              () =>
                this.load(args.id, context)
            ),
          options
        )
      }

      static [$listQuery](resolve, options = { fields: {}, args: {} }) {
        // Todo use resolve
        return getListQueryConfig(
          this[$type],
          (source, args, context, info) =>
            this[$bindContext](args, context).then(
              () =>
                this.loadAll(args, context)
            ),
          options
        )
      }

      static [$mutation](resolve, options = { fields: {}, args: {}, errorFields: {} }) {
        // Todo use resolve
        let name = key(this.name)
        return getMutationConfig(
          this[$type],
          (source, args, context, info) =>
            this[$bindContext](args, context).then(
              () =>
                this.load(args.id, context).then(
                  object =>
                    object.bind(args[name]).then(
                      bind => {
                        if (bind.erred || !bind.changes.length)
                          return Promise.resolve(bind)
                        else
                          return object.save(bind).then(
                            () =>
                              Promise.resolve(bind)
                          )
                      }
                    ).then(
                      bind => ({
                        [name]: object,
                        ...bind
                      })
                    )
                )
            ),
          options
        )
      }

      static [$subscription](subscribe, options = { args: {} }, resolve = undefined) {
        if (!this[$pubsub])
          return {}
        const name = key(this.name)
        return getSubscriptionConfig(
          this[$type],
          withFilter(
            (source, args, context, info) =>
              this[$bindContext](args, context).then(
                () =>
                  this[$pubsub].asyncIterator(name)
              ),
            (source, args, context, info) => {
              if (source) {
                if (args.id)
                  return args.id == `${source[name].id}`
                return true
              }
              return false
            }
          ),
          options,
          resolve
        )
      }
      static [$bindContext](args, context) {
        let contextVars = {
          // [$binddContext]: true
        }
        this[$context].forEach(
          key =>
            contextVars[key] = args[key] || context[key]
        )
        Object.assign(args, contextVars)
        Object.assign(context, contextVars)
        return Promise.resolve(contextVars)
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

    GraphQLEntity[$entity] = true

    return GraphQLEntity

  }
}

module.exports = GraphQLEntity

Object.assign(
  module.exports,
  {
    $type,
    $query,
    $listQuery,
    $mutation,
    $subscription,
    $pubsub,
    $bindContext,
    $boundedContext,
    $entity
  }
)