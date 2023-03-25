require('dotenv').config()
const { Client } = require('@elastic/elasticsearch')

const client = new Client({
    cloud: {
        id: process.env.CLOUD_ID_ELASTIC
    },
    auth: {
        apiKey: process.env.API_KEY_ELASTIC
    }
})

const connectElasticsearch = (req, res, next) => {
    req.elasticClient = client
    next()
}

module.exports = connectElasticsearch