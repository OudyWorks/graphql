import {
    GraphQLObjectType,
    GraphQLNonNull,
    GraphQLID
} from './'
import Case from 'case'

/**
 * 
 * @param {GraphQLObjectType} ObjectType 
 * @param {Function} resolve resolve function
 * @param {Object} options Options
 * @param {Object} options.args more argements to append to args
 */
export default function getQueryConfig(ObjectType, resolve, options = {args: {}}) {
    return {
        [Case.camel(ObjectType.name)] : {
            type: ObjectType,
            args: Object.assign(
                {
                    id: {
                        type: new GraphQLNonNull(GraphQLID)
                    }
                },
                options.args || {}
            ),
            resolve
        }
    }
}