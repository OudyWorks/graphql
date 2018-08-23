import {
    GraphQLObjectType,
    GraphQLNonNull,
    GraphQLID,
    key,
    getInputObjectType,
    getMutationObjectType
} from './'

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
            type: getMutationObjectType(ObjectType, options),
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