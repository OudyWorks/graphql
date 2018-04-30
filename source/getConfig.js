import {
    GraphQLObjectType
} from './'

/**
 * get the config of a type
 * @param {GraphQLObjectType} Type 
 */
export default function getConfig(Type) {
    return typeof Type._typeConfig.fields == 'function' ? Type._typeConfig.fields() : Type._typeConfig.fields
}