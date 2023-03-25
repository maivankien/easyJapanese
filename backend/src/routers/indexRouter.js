const homeRouter = require('./homeRouter')

const route = (app) => {
    app.use('/api/v1/home', homeRouter)
}

module.exports = route