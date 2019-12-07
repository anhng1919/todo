import http from "http";
import express from "express";
import console from "chalk-console";
import { ApolloServer } from "apollo-server-express";


// specify server port
const port = process.env.PORT || 8088

// config express with apollo server
const configureHttpServer = async (httpServer) => {
  console.info("Creating Express app")
  const expressApp = express()


  console.info("Creating Apollo server")
  // getting resolvers and schema
  const { default: resolvers } = await import(/* webpackChunkName: "resolvers" */ './resolvers')
  const { default: typeDefs } = await import(/* webpackChunkName: "typeDefs" */ '././schemas/main.graphql')

  // create new apollo server instance
  const apolloServer = new ApolloServer({
    typeDefs,
    resolvers
  })

  // apply to express
  apolloServer.applyMiddleware({
    app: expressApp
  })

  console.info("Express app created with Apollo middleware")

  // apply server's handler
  httpServer.on("request", expressApp)
  apolloServer.installSubscriptionHandlers(httpServer)
}

const runServer = async (port) => new Promise(async (resolver, rejector) => {
  if (!process.httpServer) {
    // server wasnt created
    console.info("Creating HTTP server")

    // create new server
    process.httpServer = http.createServer()

    // config it
    await configureHttpServer(process.httpServer)

    // start listening
    process.httpServer.listen(port, () => resolver(port))
  } else {
    // server was created before
    console.info("Reloading HTTP server")

    // remove current server's handler
    process.httpServer.removeAllListeners("upgrade")
    process.httpServer.removeAllListeners("request")

    // config it again
    await configureHttpServer(process.httpServer)

    console.info("HTTP server reloaded")
  }
})

runServer(port)
  .then(port => {
    console.info(`HTTP server ready at http://localhost:${port}`)
    console.info(`Websocket server ready at ws://localhost:${port}`)
  })
  .catch(error => console.log)

// hot module reload
if (module.hot) {
  module.hot.accept()
}
