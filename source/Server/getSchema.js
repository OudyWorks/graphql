import {
    GraphQLSchema,
    GraphQLObjectType,
    Entity
} from '../'
import includeAll from 'include-all'
import path from 'path'

export default function getSchema(directory) {

    let _types = includeAll({
            dirname: path.join(directory),
            // pathFilter: /types\/[A-z]+.js$/,
            flatten: true,
            keepDirectoryPath: true
        }),
        queryFields = {},
        mutationFields = {},
        subscriptionFields = {},
        validTypes = Object.keys(_types).filter(
            key =>
                _types[key].default.graphql == Entity.graphql && key.match(/types\/[A-z]+.js$/)
        ),
        types = {}

    validTypes.forEach(
        key =>
            types[key] = _types[key].default
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