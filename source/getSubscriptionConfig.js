import {
    GraphQLID,
    key
} from './'

export default function getSubscriptionConfig(ObjectType, subscribe, options = {args: {}, resolve: undefined}) {
    return {
        [key(ObjectType.name)] : {
            type: ObjectType,
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