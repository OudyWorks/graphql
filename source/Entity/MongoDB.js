import Entity from '@oudyworks/entity/MongoDB'
import extender from './extender'
import key from '../key'
import {withFilter} from 'graphql-subscriptions'

const   GraphQLEntity = extender(Entity)

class MongoDBEntity extends GraphQLEntity {
    bind(state, trackChange = true, bindObject = {}) {
        if(state._id) {
            state.id = state._id
            delete state._id
        }
        return super.bind(state, trackChange, bindObject)
    }
}


MongoDBEntity[MongoDBEntity.query] = function(resolve, options = {args: {}}) {
    if(!resolve)
        resolve = (source, args, context, info) =>
            this.load(args.id, context)
    return GraphQLEntity[MongoDBEntity.query].bind(this)(resolve, options)
}

MongoDBEntity[MongoDBEntity.listQuery] = function(resolve, options = {fields: {}, args: {}}) {
    if(!resolve)
        resolve = (source, args, context, info) =>
            this.loadAll(args, context)
    return GraphQLEntity[MongoDBEntity.listQuery].bind(this)(resolve, options)
}

MongoDBEntity[MongoDBEntity.mutation] = function(resolve, options = {fields: {}, args: {}, errorFields: {}}) {
    if(!resolve) {
        let name = key(this.name)
        resolve = (source, args, context, info) =>
            this.load(args.id, context).then(
                object =>
                    object.bind(args[name]).then(
                        bind => {
                            if(bind.erred || !bind.changes.length)
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
    }
    return GraphQLEntity[MongoDBEntity.mutation].bind(this)(resolve, options)
}

MongoDBEntity[MongoDBEntity.subscription] = function(subscribe, options = {args: {}, resolve: undefined}) {
    if(!subscribe)
        subscribe = withFilter(
            (source, args, context, info) =>
                GraphQLEntity.pubsub.asyncIterator(key(this.name)),
            (source, args, context, info) => {
                if(source) {
                    if(args.id)
                        return args.id == `${source.id}`
                    return true
                }
                return false
            }
        )
    return GraphQLEntity[MongoDBEntity.subscription].bind(this)(subscribe, options)
}



export default MongoDBEntity