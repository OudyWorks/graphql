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
    key
} from '../'
import deepClone from 'lodash.clonedeep'
import flattenObj from 'flatten-obj'
import {
    diff
} from 'deep-object-diff'
import { PubSub } from 'graphql-subscriptions'
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
                                    this.validate(state, bindObject.errors).then(
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

                                let difference = flatten(diff(oldObject, this)),
                                    changes = Object.keys(difference)

                                resolve(
                                    Object.assign(
                                        bindObject,
                                        {
                                            oldObject,
                                            newObject: this,
                                            difference,
                                            changes,
                                            changed: !!changes.length
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
        static get config() {
            return {
                type: this.type,
                resolve: (args, context) =>
                    this.load(args[key(this.type.name)], context)
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
            (source, args, context, info) => {
                this[Entity.context].forEach(
                    key =>
                        context[key] = args[key] || context[key]
                )
                return resolve(source, args, context, info)
            },
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
            (source, args, context, info) => {
                this[Entity.context].forEach(
                    key =>
                        context[key] = args[key] || context[key]
                )
                return resolve(source, args, context, info)
            },
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
            (source, args, context, info) => {
                this[Entity.context].forEach(
                    key =>
                        context[key] = args[key] || context[key]
                )
                return resolve(source, args, context, info)
            },
            options
        )
    }

    GraphQLEntity.pubsub = new PubSub()
    GraphQLEntity.subscription = Symbol('subscription')
    GraphQLEntity[GraphQLEntity.subscription] = function(subscribe, options = {args: {}, resolve: undefined}) {
        this[Entity.context].forEach(
            key =>
                options.args[key] = {
                    type: new GraphQLNonNull(GraphQLID)
                }
        )
        if(!options.resolve)
            options.resolve = (source, args, context, info) => {
                this[Entity.context].forEach(
                    key =>
                        context[key] = args[key] || context[key]
                )
                return source
            }
        else {
            let resolve = options.resolve
            options.resolve = (source, args, context, info) => {
                this[Entity.context].forEach(
                    key =>
                        context[key] = args[key] || context[key]
                )
                return resolve(source, args, context, info)
            }
        }
        return getSubscriptionConfig(
            this.type,
            subscribe,
            options
        )
    }

    GraphQLEntity.graphql = FirstGraphQLEntity && FirstGraphQLEntity.graphql || undefined
    
    return  GraphQLEntity

}