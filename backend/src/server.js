require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const route = require('./routers/indexRouter')

const notFound = require('./middlewares/notFound')
const connectMySql = require('./config/mySQL')
const connectRedis = require('./config/redisDB')
const connectMongoDB = require('./config/mongoDB')
const connectElasticsearch = require('./config/elasticsearch')

const app = express()

mongoose.set('strictQuery', false);

app.use(connectRedis)
app.use(connectMySql)
app.use(connectElasticsearch)


app.use(express.json())
app.use(express.urlencoded({ extended: true }))

route(app)

app.use(notFound)

const port = process.env.PORT
const hostname = process.env.HOST_NAME

    ; (async () => {
        try {
            await connectMongoDB()
            app.listen(port, hostname, () => {
                console.log('Back end listening on port', port)
            })
        } catch (error) {
            console.log(">>>> Error: ", error)
        }
    })()