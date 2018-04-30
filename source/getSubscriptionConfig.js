import {
    GraphQLID
} from './'
import Case from 'case'

export default function getSubscriptionConfig(ObjectType, subscribe, options = {args: {}, resolve: undefined}) {
    return {
        [Case.camel(ObjectType.name)] : {
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