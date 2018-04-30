import express from 'express'
import graphql from 'express-graphql'
import {
    graphiqlExpress,
} from 'apollo-server-express'
import bodyParser from 'body-parser'
import { execute, subscribe } from '../'
import { SubscriptionServer } from 'subscriptions-transport-ws'
import WebSocket from 'ws'
import url from 'url'
import {maskErrors} from 'graphql-errors'
import getSchema from './getSchema'

export default class Index {
    constructor(server, schema) {

        if(!server)
            throw `Can't construct a Server without a server`

        if(!schema)
            throw `Can't construct a Server without a schema`

        schema = getSchema(schema)

        this.server = server

        this.app = express()

        // this.app.use(bodyParser.json({limit: '1mb'}))

        this.app.use(/^\/$/, graphql(
            request => ({
                schema,
                context: {
                    timestamp: +new Date()
                }
            })
        ))

        this.server.on('request', this.app)

        this.subscription = new SubscriptionServer({
            execute(schema, document, rootValue, contextValue, variableValues, operationName) {
                let context = {
                    timestamp: +new Date()
                }
                return execute(schema, document, rootValue, context, variableValues, operationName)
            },
            subscribe(schema, document, rootValue, contextValue, variableValues, operationName) {
                let context = {
                    timestamp: +new Date()
                }
                return subscribe(schema, document, rootValue, context, variableValues, operationName)
            },
            schema
        }, {
            noServer: true
        })

        this.server.on(
            'upgrade',
            (request, socket, head) => {

                switch (url.parse(request.url).pathname) {

                    case '/':

                        this.subscription.server.handleUpgrade(
                            request, socket, head,
                            ws =>
                                this.subscription.server.emit('connection', ws, request)
                        )

                        break

                    // default :
                    //
                    //     socket.destroy()
                    //
                    //     break

                }

            }
        )

    }
    graphiql(options = {endpointURL: '/'}) {
        this.app.use('/graphiql', graphiqlExpress(options))
    }
}