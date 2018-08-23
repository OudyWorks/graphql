import {
    GraphQLObjectType,
    GraphQLBoolean,
    GraphQLList,
    GraphQLString,
    getErrorType,
    key
} from './'

export default function getMutationObjectType(ObjectType, options = {fields: {}, errorFields: {}}) {
    return ObjectType._typeMutation || (ObjectType._typeMutation = new GraphQLObjectType({
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
    }))
}