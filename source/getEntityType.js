import getConfig from './getConfig'

export default function getEntityType(ObjectType) {

    if (ObjectType._entityType)
        return ObjectType._entityType

    let config = getConfig(ObjectType),
        type = {}

    Object.keys(config).forEach(
        key => {

            if (config[key]._entityType)
                type[key] = config[key]._entityType

            else
                switch (config[key].type.constructor.name) {

                    case 'GraphQLScalarType':

                        switch (config[key].type.name) {

                            case 'ID':
                            case 'String':
                                type[key] = String
                                break

                            case 'Int':
                            case 'Float':
                                type[key] = Number
                                break


                            case 'Boolean':
                                type[key] = Boolean
                                break

                            default:
                                type[key] = config[key].entityType || String
                                break

                        }

                        break

                    case 'GraphQLList':
                        type[key] = Array
                        break

                    case 'GraphQLObjectType':

                        let _config = getConfig(config[key].type)

                        if (_config.id && !config[key].type.entityLess)
                            type[key] = String

                        else
                            type[key] = getEntityType(config[key].type)

                        break

                    default:
                        type[key] = String
                        break

                }

        }
    )

    return ObjectType._entityType = type

}