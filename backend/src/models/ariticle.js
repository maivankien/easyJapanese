require('dotenv').config()
const ariticle = require('../config/couchDB').connect(process.env.DB_NAME)

module.exports = ariticle