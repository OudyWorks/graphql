import build from '@oudyworks/entity/build'
import bind from '@oudyworks/entity/bind'
import {
    getEntityType,
    getInputObjectType,
    getErrorType,
    getMutationConfig,
    getQueryConfig,
    getListQueryConfig,
    getSubscriptionConfig,
    GraphQLNonNull,
    GraphQLID,
    GraphQLString,
    key,
    GraphQLList
} from '../'
import deepClone from 'lodash.clonedeep'
import flattenObj from 'flatten-obj'
import {
    detailedDiff, diff as _diff
} from 'deep-object-diff'
import {
    withFilter
} from 'graphql-subscriptions'
import FirstGraphQLEntity from './index'
const flatten = flattenObj()

export default function extender (Entity) {

    class GraphQLEntity extends Entity {
        build() {
            build(
                this,
                getEntityType(this.constructor.type)
            )
        }
        bind(state, trackChange = true, bindObject = {}) {
            return new Promise(
                resolve => {

                    if(trackChange) {

                        let oldObject = deepClone(this)

                        new Promise(
                            resolve => {
                                if(typeof this.validate == 'function') {
                                    bindObject.errors = {}
                                    bindObject.erred = {}
                                    this.validate(state, bindObject.errors, this[Entity.context]).then(
                                        () => {
                                            bindObject.erred = !!Object.values(flatten(bindObject.errors)).filter(e => e).length
                                            resolve()
                                        }
                                    )
                                } else
                                    resolve()
                            }
                        ).then(
                            () => {

                                bind(this, state, getEntityType(this.constructor.type))

                                let difference = flatten(_diff(oldObject, this)),
                                    diff = detailedDiff(oldObject, this),
                                    changes = Object.keys(difference)

                                resolve(
                                    Object.assign(
                                        bindObject,
                                        {
                                            oldObject,
                                            newObject: this,
                                            difference,
                                            diff,
                                            changes,
                                            changed: !!changes.length,
                                            context: this[Entity.context],
                                            id: this.id
                                        }
                                    )
                                )

                            }
                        )

                    } else {

                        bind(this, state, getEntityType(this.constructor.type))
                        resolve(this)

                    }
                }
            )
        }
        save(bind) {
            return super.save(bind).then(
                id => {
                    if(bind && bind.changed && !bind.erred && this.constructor.pubsub)
                        this.constructor.pubsub.publish(
                            key(this.constructor.name),
                            {
                                [key(this.constructor.name)]: this,
                                ...bind
                            }
                        )
                    return id
                }
            )
        }
        static get config() {
            return this.configFor(key(this.type.name))
        }
        static get configMany() {
            return this.configManyFor(key(this.pluralName))
        }
        static configFor(key) {
            return {
                type: this.type,
                resolve: (source, args, context) =>
                    this.load(source[key], context)
            }
        }
        static configManyFor(key) {
            return {
                type: new GraphQLList(this.type),
                resolve: (source, args, context) =>
                    this.loadMany(source[key], context)
            }
        }
    }
    
    GraphQLEntity.input = Symbol('input')
    GraphQLEntity[GraphQLEntity.input] = function() {
        return getInputObjectType(this.type)
    }
    
    GraphQLEntity.error = Symbol('error')
    GraphQLEntity[GraphQLEntity.error] = function(moreFields = {}) {
        return getErrorType(this.type, moreFields)
    }
    
    GraphQLEntity.bindContext = Symbol('bindContext')
    GraphQLEntity[GraphQLEntity.bindContext] = function(args, context) {
        let contextVars = {}
        this[Entity.context].forEach(
            key =>
                contextVars[key] = args[key] || context[key]
        )
        return this[Entity.validateContext](contextVars).then(
            () => {
                Object.assign(args, contextVars)
                Object.assign(context, contextVars)
            }
        )
    }
    GraphQLEntity.query = Symbol('query')
    GraphQLEntity[GraphQLEntity.query] = function(resolve, options = {args: {}}) {
        this[Entity.context].forEach(
            key =>
                options.args[key] = {
                    type: new GraphQLNonNull(GraphQLID)
                }
        )
        return getQueryConfig(
            this.type,
            (source, args, context, info) =>
                this[GraphQLEntity.bindContext](args, context).then(
                    () =>
                        resolve(source, args, context, info)
                ),
            options
        )
    }
    
    GraphQLEntity.listQuery = Symbol('listQuery')
    GraphQLEntity[GraphQLEntity.listQuery] = function(resolve,  options = {fields: {}, args: {}}) {
        this[Entity.context].forEach(
            key =>
                options.args[key] = {
                    type: new GraphQLNonNull(GraphQLID)
                }
        )
        this.type.pluralName = this.pluralName
        return getListQueryConfig(
            this.type,
            (source, args, context, info) =>
                this[GraphQLEntity.bindContext](args, context).then(
                    () =>
                        resolve(source, args, context, info)
                ),
            options
        )
    }

    GraphQLEntity.mutation = Symbol('mutation')
    GraphQLEntity[GraphQLEntity.mutation] = function(resolve, options = {fields: {}, args: {}, errorFields: {}}) {
        this[Entity.context].forEach(
            key => {
                options.args[key] = {
                    type: new GraphQLNonNull(GraphQLID)
                }
                options.errorFields[key] = {
                    type: GraphQLString
                }
            }
        )
        return getMutationConfig(
            this.type,
            (source, args, context, info) =>
                this[GraphQLEntity.bindContext](args, context).then(
                    () =>
                        resolve(source, args, context, info)
                ),
            options
        )
    }

    // GraphQLEntity.pubsub = new PubSub()
    GraphQLEntity.subscription = Symbol('subscription')
    GraphQLEntity[GraphQLEntity.subscription] = function(subscribe, options = {args: {}, resolve: undefined}) {
        this[Entity.context].forEach(
            key =>
                options.args[key] = {
                    type: new GraphQLNonNull(GraphQLID)
                }
        )
        let resolve = options.resolve
        options.resolve = (source, args, context, info) =>
            this[GraphQLEntity.bindContext](args, context).then(
                () =>
                    resolve ? resolve(source, args, context, info) : source
            )
        if(!subscribe)
            subscribe = withFilter(
                (source, args, context, info) =>
                    this.pubsub.asyncIterator(key(this.name)),
                (source, args, context, info) => {
                    if(source) {
                        if(args.id)
                            return args.id == `${source[key(this.name)].id}`
                        return true
                    }
                    return false
                }
            )
        return getSubscriptionConfig(
            this.type,
            subscribe,
            options
        )
    }

    GraphQLEntity.graphql = FirstGraphQLEntity && FirstGraphQLEntity.graphql || undefined
    
    return  GraphQLEntity

}