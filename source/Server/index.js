import express from 'express'
import {
    graphqlExpress,
    graphiqlExpress,
} from 'apollo-server-express'
import bodyParser from 'body-parser'
import { execute, subscribe } from '../'
import { SubscriptionServer } from 'subscriptions-transport-ws'
import WebSocket from 'ws'
import url from 'url'
import {maskErrors} from 'graphql-errors'
import getSchema from './getSchema'

export default class Server {
    constructor(server, schema) {

        if(!server)
            throw `Can't construct a Server without a server`

        if(!schema)
            throw `Can't construct a Server without a schema`

        schema = getSchema(schema)

        this.server = server

        this.app = express()

        this.app.use(/^\/$/, bodyParser.json({limit: '100mb'}), graphqlExpress(
            request =>
                this.context(request).then(
                    context =>
                        ({
                            schema,
                            context
                        })
                )
        ))

        this.server.on('request', this.app)

        this.subscription = new SubscriptionServer({
            execute,
            subscribe,
            onConnect: (connectionParams, webSocket, context) => {
                return this.context(webSocket.upgradeReq, true)
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
    async context(request, subscription = false) {
        return {
            timestamp: +new Date()
        }
    }
    graphiql(options = {endpointURL: '/'}) {
        this.app.use('/graphiql', graphiqlExpress(options))
    }
}