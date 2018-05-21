import {
    GraphQLObjectType,
    GraphQLNonNull,
    GraphQLID,
    GraphQLBoolean,
    GraphQLList,
    GraphQLString,
    key
} from './'
import getInputObjectType from './getInputObjectType'
import getErrorType from './getErrorType'

/**
 * get Mutation Config for GraphQLObjectType
 * @param {GraphQLObjectType} ObjectType 
 * @param {Function} resolve resolve function
 * @param {Object} options Options
 * @param {Object} options.fields fields to append on mutation fields
 * @param {Object} options.args args to append on mutation args
 * @param {Object} options.errorFields fields to append on mutation errors fields
 */
export default function getMutationConfig(ObjectType, resolve,  options = {fields: {}, args: {}, errorFields: {}}) {
    return {
        [key(ObjectType.name)] : {
            type: new GraphQLObjectType({
                name: `${ObjectType.name}Mutation`,
                fields: Object.assign(
                    {
                        [key(ObjectType.name)]: {
                            type: ObjectType
                        },
                        erred: {
                            type: GraphQLBoolean
                        },
                        errors: {
                            type: getErrorType(ObjectType, options.errorFields || {})
                        },
                        changed: {
                            type: GraphQLBoolean
                        },
                        changes: {
                            type: new GraphQLList(GraphQLString)
                        }
                    },
                    options.fields || {}
                )
            }),
            args: Object.assign(
                {
                    [key(ObjectType.name)]: {
                        type: new GraphQLNonNull(
                            getInputObjectType(ObjectType)
                        )
                    },
                    id: {
                        type: GraphQLID,
                        defaultValue: ''
                    }
                },
                options.args || {}
            ),
            resolve
        }
    }
}