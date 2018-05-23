import {
    GraphQLInputObjectType,
    GraphQLObjectType,
    GraphQLList,
    GraphQLScalarType,
    GraphQLEnumType,
    GraphQLUnionType,
    GraphQLID
} from './'
import getConfig from './getConfig'
import Scalar from './Scalar'

/**
 * get an GraphQLInputObjectType from GraphQLObjectType
 * @param {(GraphQLObjectType|GraphQLList|GraphQLScalarType|GraphQLEnumType|GraphQLUnionType)} ObjectType Type to convert
 * @param {Boolean} deep
 * @returns Input type
 */
export default function getInputObjectType(ObjectType, deep = false) {

    if(!deep && ObjectType._typeInput)
        return ObjectType._typeInput

    switch (ObjectType.constructor.name) {

        case 'GraphQLObjectType':

            let _fields = getConfig(ObjectType)

            if(deep && _fields.id && !ObjectType.entityLess)
                return GraphQLID

            return ObjectType._typeInput || (ObjectType._typeInput = new GraphQLInputObjectType({
                name: `${ObjectType.name}Input`,
                fields() {
                    let fields = {}
                    Object.keys(_fields).forEach(
                        key =>
                            fields[key] = {
                                type: getInputObjectType(_fields[key].type, true)
                            }
                    )
                    return fields
                }
            }))

        case 'GraphQLScalarType':
        case 'GraphQLEnumType':

            return ObjectType

        case 'GraphQLUnionType':

            return Scalar

        case 'GraphQLList':
    
            return new GraphQLList(
                getInputObjectType(ObjectType.ofType, true)
            )

    }
}