import {
    GraphQLInputObjectType,
    GraphQLObjectType,
    GraphQLList,
    GraphQLScalarType,
    GraphQLEnumType,
    GraphQLUnionType
} from './'
import getConfig from './getConfig'
import Scalar from './Scalar'

/**
 * get an GraphQLInputObjectType from GraphQLObjectType
 * @param {(GraphQLObjectType|GraphQLList|GraphQLScalarType|GraphQLEnumType|GraphQLUnionType)} ObjectType Type to convert
 * @returns Input type
 */
export default function getInputObjectType(ObjectType) {

    if(ObjectType._typeInput)
        return ObjectType._typeInput

    switch (ObjectType.constructor.name) {

        case 'GraphQLObjectType':

            return ObjectType._typeInput = new GraphQLInputObjectType({
                name: `${ObjectType.name}Input`,
                fields() {
                    let fields = {},
                        _fields = getConfig(ObjectType)
                    Object.keys(_fields).forEach(
                        key =>
                            fields[key] = {
                                type: getInputObjectType(_fields[key].type)
                            }
                    )
                    return fields
                }
            })

        case 'GraphQLScalarType':
        case 'GraphQLEnumType':

            return ObjectType

        case 'GraphQLUnionType':

            return Scalar

        case 'GraphQLList':
    
            return new GraphQLList(
                getInputObjectType(ObjectType.ofType)
            )

    }
}