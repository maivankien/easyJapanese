require('dotenv').config()
const { Translate } = require('@google-cloud/translate')

const translate = new Translate({ projectId: process.env.TRANSLATE_GOOGLE_ID })

module.exports = translate