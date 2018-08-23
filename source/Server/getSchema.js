import {
    GraphQLSchema,
    GraphQLObjectType,
    Entity
} from '../'
import recursiveReadSync from 'recursive-readdir-sync'

const typesRgeex = /types[\\\/][a-zA-Z0-9]+.js$/,
    queriesRgeex = /queries[\\\/][a-zA-Z0-9]+.js$/,
    mutationsRgeex = /mutations[\\\/][a-zA-Z0-9]+.js$/,
    subscriptionsRgeex = /subscriptions[\\\/][a-zA-Z0-9]+.js$/

export default function getSchema(directory) {

    let queryFields = {},
        mutationFields = {},
        subscriptionFields = {},
        files = recursiveReadSync(directory).sort((a, b) => a.length - b.length),
        validTypes = files.filter(
            file =>
                file.match(typesRgeex)
        ),
        types = {},
        queries = files.filter(
            file =>
                file.match(queriesRgeex)
        ),
        mutations = files.filter(
            file =>
                file.match(mutationsRgeex)
        ),
        subscriptions = files.filter(
            file =>
                file.match(subscriptionsRgeex)
        )

    queries.forEach(
        file => {
            try {
                Object.assign(queryFields, require(file).default)
            } catch(error) {
                throw {
                    message: `Error while loading the query ${file}`,
                    error
                }
            }
        }
    )

    mutations.forEach(
        file => {
            try {
                Object.assign(mutationFields, require(file).default)
            } catch(error) {
                throw {
                    message: `Error while loading the mutation ${file}`,
                    error
                }
            }
        }
    )

    subscriptions.forEach(
        file => {
            try {
                Object.assign(subscriptionFields, require(file).default)
            } catch(error) {
                throw {
                    message: `Error while loading the subscription ${file}`,
                    error
                }
            }
        }
    )

    validTypes.forEach(
        file => {
            try {
                let Type = require(file).default
                if(Type.graphql == Entity.graphql)
                    types[file] = Type
            } catch(error) {
                throw {
                    message: `Error while loading the type ${file}`,
                    error
                }
            }
        }
    )

    validTypes = Object.keys(types)

    validTypes.forEach(
        key =>
            Object.assign(queryFields, types[key][types[key].query]())
    )

    validTypes.forEach(
        key =>
            Object.assign(queryFields, types[key][types[key].listQuery]())
    )

    validTypes.forEach(
        key =>
            Object.assign(mutationFields, types[key][types[key].mutation]())
    )

    validTypes.forEach(
        key =>
            types[key].pubsub && Object.assign(subscriptionFields, types[key][types[key].subscription]())
    )

    let schema = {}

    if(Object.keys(queryFields).length)
        schema.query = new GraphQLObjectType({
            name: 'Query',
            fields: queryFields
        })

    if(Object.keys(mutationFields).length)
        schema.mutation = new GraphQLObjectType({
            name: 'Mutation',
            fields: mutationFields
        })

    if(Object.keys(subscriptionFields).length)
        schema.subscription = new GraphQLObjectType({
            name: 'Subscription',
            fields: subscriptionFields
        })

    return new GraphQLSchema(schema)

}