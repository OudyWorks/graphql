import {
    GraphQLObjectType,
    GraphQLList,
    GraphQLScalarType,
    GraphQLEnumType,
    GraphQLUnionType,
    GraphQLString
} from './'
import getConfig from './getConfig'

/**
 * get an ErrorType from GraphQLObjectType
 * @param {(GraphQLObjectType|GraphQLList|GraphQLScalarType|GraphQLEnumType|GraphQLUnionType)} ObjectType Type to convert
 * @returns Error type
 */
export default function getErrorType(ObjectType, moreFields = {}) {

    if(ObjectType._typeError)
        return ObjectType._typeError

    switch (ObjectType.constructor.name) {

        case 'GraphQLObjectType':

            return ObjectType._typeError = new GraphQLObjectType({
                name: `${ObjectType.name}Error`,
                fields() {
                    let fields = {},
                        _fields = getConfig(ObjectType)
                    Object.keys(_fields).forEach(
                        key =>
                            fields[key] = {
                                type: getErrorType(_fields[key].type)
                            }
                    )
                    return Object.assign(
                        fields,
                        moreFields
                    )
                }
            })

        case 'GraphQLScalarType':
        case 'GraphQLEnumType':
        case 'GraphQLUnionType':

            return GraphQLString

        case 'GraphQLList':
    
            return new GraphQLList(
                getErrorType(ObjectType.ofType)
            )

    }
}