const express = require('express');
const colors = require('colors');
const cors = require('cors');
const { graphqlHTTP} = require('express-graphql');
const schema = require('./schema/schema');
const isAuth = require('./middleware/isAuth');
const {loadData} = require('./data/loadData');

require('dotenv').config();
console.log(process.env)

const connectDB = require('./config/db')
const port = process.env.PORT || 5000;

const app = express();
connectDB();
app.use(cors());
app.use(isAuth);
app.use('/graphql', graphqlHTTP({
    schema, 
    graphiql: true
}))

app.listen(port, console.log(`Server running on ${port}`));

loadData("test");