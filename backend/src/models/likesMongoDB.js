const mongoose = require('mongoose')

const likeSchema = new mongoose.Schema({
    user_id: {
        type: String,
        require: true
    },
    translation_id: {
        type: mongoose.Schema.Types.ObjectId,
        require: true
    },
    status: {
        type: Number,
        default: 0
    }
})

const Likes = mongoose.model('Likes', likeSchema)

module.exports = Likes