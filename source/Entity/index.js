import Entity from '@oudyworks/entity'
import extender from './extender'

const GraphQLEntity = extender(Entity)

GraphQLEntity.graphql = Symbol('graphql')

export default GraphQLEntity