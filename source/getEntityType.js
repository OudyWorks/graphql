import getConfig from './getConfig'

export default function getEntityType(ObjectType) {

    let config = getConfig(ObjectType),
        type = {}

    Object.keys(config).forEach(
        key => {

            switch(key, config[key].type.constructor.name) {

                case 'GraphQLScalarType':

                    switch(config[key].type.name) {

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
                            type[key] = String
                            break
        
                    }

                    break
                
                case 'GraphQLList':
                    type[key] = Array
                    break

                case 'GraphQLObjectType':

                    let _config = getConfig(config[key].type)

                    if(_config.id)
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

    return type

}