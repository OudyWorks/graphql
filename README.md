# @oudyworks/graphql

let's consider this type

```js
import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLID
} from '@oudyworks/graphql'

const Type = new GraphQLObjectType({
    name: 'Example',
    fields: {
        id: {
            type: GraphQLID
        },
        name: {
            type: GraphQLString
        }
    }
})
```

## getConfig(Type)
getConfig(Type) will return the fields used of **Type**, in graphql fields could be an object or a function, getConfig(Type) returns the object eitherwa

```js
import {
  getConfig
} from '@oudyworks/graphql'

let fields = getConfig(Type)
// fields = {
//     id: {
//         type: GraphQLID
//     },
//     name: {
//         type: GraphQLString
//     }
// }
```

## getInputObjectType(Type)
getInputObjectType(Type) will create a GraphQLInputObjectType with the same fields of **Type**

```js
import {
  getInputObjectType
} from '@oudyworks/graphql'

let inputType = getInputObjectType(Type)
// inputType = new GraphQLInputObjectType({
//     name: 'ExampleInput',
//     fields: {
//         id: {
//             type: GraphQLID
//         },
//         name: {
//             type: GraphQLString
//         }
//     }
// })
```

## getErrorType(Type)
get a type with the same fields of Type for Errors

## Scalar
Scalar is a scalar type for grahql, it can be a String, Boolean, Integer, Float, Object or Array

```js
import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLID,
  Scalar
} from '@oudyworks/graphql'

const Type = new GraphQLObjectType({
    name: 'ScalarExample',
    fields: {
        id: {
            type: GraphQLID
        },
        type: {
            type: GraphQLString
        },
        data: {
            type: Scalar
        }
    }
})
```