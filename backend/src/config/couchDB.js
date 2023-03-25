require('dotenv').config()
const nano = require('nano')(process.env.DB_COUCHDB_HOST)

module.exports = {
    connect(databaseName) {
        return nano.db.use(databaseName)
    },
    create(databaseName, callback) {
        return nano.db.create(databaseName, callback)
    }
}