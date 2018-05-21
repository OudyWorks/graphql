import {
    GraphQLObjectType,
    GraphQLList,
    GraphQLInt,
    key
} from './'
import plural from 'plural'

/**
 * 
 * @param {GraphQLObjectType} ObjectType 
 * @param {Function} resolve resolve function
 * @param {Object} options Options
 * @param {Object} options.fields more fields to append to fields 
 * @param {Object} options.args more argements to append to args 
 */
export default function getQueryConfig(ObjectType, resolve,  options = {fields: {}, args: {}}) {
    return {
        [key(ObjectType.pluralName || plural(ObjectType.name))] : {
            type: new GraphQLObjectType({
                name: ObjectType.pluralName || plural(ObjectType.name),
                fields: Object.assign(
                    {
                        list: {
                            type: new GraphQLList(ObjectType)
                        },
                        total: {
                            type: GraphQLInt
                        },
                        page: {
                            type: GraphQLInt
                        },
                        limit: {
                            type: GraphQLInt
                        }
                    },
                    options.fields || {}
                )
            }),
            args: Object.assign(
                {
                    page: {
                        type: GraphQLInt,
                        defaultValue: 1
                    },
                    limit: {
                        type: GraphQLInt,
                        defaultValue: 20
                    }
                },
                options.args || {}
            ),
            resolve
        }
    }
}