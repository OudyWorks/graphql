import {
    GraphQLID,
    key,
    getMutationObjectType
} from './'

export default function getSubscriptionConfig(ObjectType, subscribe, options = {args: {}, resolve: undefined}) {
    return {
        [key(ObjectType.name)] : {
            type: getMutationObjectType(ObjectType),
            args: Object.assign(
                {
                    id: {
                        type: GraphQLID
                    }
                },
                options.args || {}
            ),
            subscribe,
            resolve: options.resolve
        }
    }
}