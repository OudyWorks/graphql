import {
    GraphQLSchema,
    GraphQLObjectType,
    Entity
} from '../'
import recursiveReadSync from 'recursive-readdir-sync'
import path from 'path'

export default function getSchema(directory) {

    let queryFields = {},
        mutationFields = {},
        subscriptionFields = {},
        files = recursiveReadSync(directory),
        validTypes = files.filter(
            file =>
                file.match(/types\/[A-z]+.js$/)
        ),
        types = {}

    validTypes.forEach(
        file => {
            let Type = require(file).default
            if(Type.graphql == Entity.graphql)
                types[file] = Type
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
            Object.assign(subscriptionFields, types[key][types[key].subscription]())
    )

    return new GraphQLSchema({
        query: new GraphQLObjectType({
            name: 'Query',
            fields: queryFields
        }),
        mutation: new GraphQLObjectType({
            name: 'Mutation',
            fields: mutationFields
        }),
        subscription: new GraphQLObjectType({
            name: 'Subscription',
            fields: subscriptionFields
        })
    })

}