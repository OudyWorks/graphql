import Entity from '@oudyworks/entity'
import build from '@oudyworks/entity/build'
import {
    getEntityType,
    getInputObjectType,
    getErrorType,
    getMutationConfig,
    getQueryConfig,
    getListQueryConfig
} from '../'

class GraphQLEntity extends Entity {
    build() {
        build(
            this,
            getEntityType(this.constructor.type)
        )
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

GraphQLEntity.subscription = Symbol()

export default GraphQLEntity