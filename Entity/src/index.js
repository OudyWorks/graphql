import {
  $pluralName,
  $context,
  $type as $entityType
} from '@oudy/entity'
import {
  key,
  GraphQLList,
  getQueryConfig,
  getListQueryConfig,
  getMutationConfig,
  getSubscriptionConfig,
  GraphQLNonNull,
  GraphQLID
} from '@oudy/graphql'
import {
  withFilter
} from 'graphql-subscriptions'
import getEntityType from './getEntityType'

const $type = Symbol('type'),
  $bindContext = Symbol('bindContext'),
  $boundedContext = Symbol('boundedContext'),
  $query = Symbol('query'),
  $listQuery = Symbol('listQuery'),
  $mutation = Symbol('mutation'),
  $subscription = Symbol('subscription'),
  $entity = Symbol('entity'),
  $pubsub = Symbol('pubsub')

export {
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

export function use(Entity) {

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
      this[$context].forEach(
        key =>
          options.args[key] = {
            type: new GraphQLNonNull(GraphQLID)
          }
      )
      return getQueryConfig(
        this[$type],
        resolve || ((source, args, context, info) => {
          return this[$bindContext](args, context).then(
            () =>
              this.load(args.id, context)
          )
        }),
        options
      )
    }

    static [$listQuery](resolve, options = { fields: {}, args: {} }) {
      this[$context].forEach(
        key =>
          options.args[key] = {
            type: new GraphQLNonNull(GraphQLID)
          }
      )
      this[$type].pluralName = this[$pluralName]()
      return getListQueryConfig(
        this[$type],
        resolve || ((source, args, context, info) => {
          return this[$bindContext](args, context).then(
            () =>
              this.loadAll(args, context)
          )
        }),
        options
      )
    }

    static [$mutation](resolve, options = { fields: {}, args: {}, errorFields: {} }) {
      this[$context].forEach(
        key =>
          options.args[key] = {
            type: new GraphQLNonNull(GraphQLID)
          }
      )
      let name = key(this.name)
      return getMutationConfig(
        this[$type],
        resolve || ((source, args, context, info) => {
          return this[$bindContext](args, context).then(
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
          )
        }),
        options
      )
    }

    static [$subscription](subscribe, options = { args: {} }, resolve = undefined) {
      if (!this[$pubsub])
        return {}
      this[$context].forEach(
        key =>
          options.args[key] = {
            type: GraphQLID
          }
      )
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
              return ['id'].concat(this[$context]).every(
                key =>
                  !args[key] || args[key] == `${source[name][key]}`
              )
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

  GraphQLEntity.__defineGetter__(
    $entityType,
    function () {
      return this._type || (this._type = getEntityType(this[$type]))
    }
  )

  GraphQLEntity[$entity] = true

  return GraphQLEntity

}