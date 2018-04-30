import build from '@oudyworks/entity/build'
import bind from '@oudyworks/entity/bind'
import {
    getEntityType,
    getInputObjectType,
    getErrorType,
    getMutationConfig,
    getQueryConfig,
    getListQueryConfig,
    getSubscriptionConfig
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
                    this.load(args.id, context)
            }
        }
    }
    
    GraphQLEntity.input = Symbol()
    GraphQLEntity[GraphQLEntity.input] = function() {
        return getInputObjectType(this.type)
    }
    
    GraphQLEntity.error = Symbol()
    GraphQLEntity[GraphQLEntity.error] = function(moreFields = {}) {
        return getErrorType(this.type, moreFields)
    }
    
    GraphQLEntity.mutation = Symbol()
    GraphQLEntity[GraphQLEntity.mutation] = function(resolve, options = {fields: {}, args: {}, errorFields: {}}) {
        return getMutationConfig(this.type, resolve, options)
    }
    
    GraphQLEntity.query = Symbol()
    GraphQLEntity[GraphQLEntity.query] = function(resolve, options = {args: {}}) {
        return getQueryConfig(this.type, resolve, options)
    }
    
    GraphQLEntity.listQuery = Symbol()
    GraphQLEntity[GraphQLEntity.listQuery] = function(resolve,  options = {fields: {}, args: {}}) {
        return getListQueryConfig(this.type, resolve, options)
    }

    GraphQLEntity.pubsub = new PubSub()
    GraphQLEntity.subscription = Symbol()
    GraphQLEntity[GraphQLEntity.subscription] = function(subscribe, options = {args: {}}) {
        return getSubscriptionConfig(this.type, subscribe, options)
    }

    GraphQLEntity.graphql = FirstGraphQLEntity && FirstGraphQLEntity.graphql || undefined
    
    return  GraphQLEntity

}