const routes = require('./src/routes.js')
require('dotenv').config()
const express = require('express')
const app  = express()
const port = process.env.PORT
app.set('view engine', 'pug') 
app.set('views', './views')
app.use(express.static('./public'))  // store front-end files in ./public

routes(app)


app.listen(port, () => console.log(`App listening on port ${port}`))

