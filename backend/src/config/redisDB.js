require('dotenv').config()
const { createClient } = require('redis')

const client = createClient({
    url: process.env.DB_REDIS_URL
})

client.on('error', err => console.log('Redis Client Error', err))

client.connect()

const connectRedis = async (req, res, next) => {
    req.redisClient = client
    next()
}

module.exports = connectRedis