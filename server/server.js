const express = require('express');
// import ApolloServer 
const {ApolloServer} = require('apollo-server-express');
const {authMiddleware} = require('./utils/auth')
const path = require('path')
//import our typeDefs and resolvers 
const {typeDefs, resolvers} = require('./schemas')
const db = require('./config/connection');

const PORT = process.env.PORT || 3001;
//create a new apollo server and pass in our schema data
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: authMiddleware
})
const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// create a new instance of an apollo server with the GraphQL schema
const startApolloServer = async (typeDefs, resolvers) => {
  await server.start();
  // integrate our apollo server with the express app as a middleware
  server.applyMiddleware({app});

  if(process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname,'../client/build')))
  }

  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname,'../client/build/index.html'))
  })
  db.once('open', () => {
    app.listen(PORT, () => {
      console.log(`API server running on port ${PORT}!`);
    });
  });
}

  // call the async function to start the server
startApolloServer(typeDefs, resolvers);


