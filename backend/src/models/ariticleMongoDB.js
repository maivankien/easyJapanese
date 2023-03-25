const mongoose = require('mongoose')

const ariticleSchema = new mongoose.Schema({
    title: {
        type: String,
        require: true
    },
    link: {
        type: String,
        require: true
    },
    post_date: {
        type: Number,
        require: true
    },
    nameLink: {
        type: String,
        require: true
    },
    pubDate: {
        type: String,
        require: true
    },
    genre: {
        type: String,
        require: true
    },
    type: {
        type: String,
        require: true,
    },
    topic: {
        type: String,
        require: true
    },
    content: {
        img_link: { type: String, require: true },
        description: { type: String, require: true },
        content: { type: String, require: true }
    },
    translate: [
        {
            translation: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Translation'
            },
            language: {
                type: String,
                require: true
            },
        }
    ]
})

const Ariticle = mongoose.model('Ariticle', ariticleSchema)

module.exports = Ariticle