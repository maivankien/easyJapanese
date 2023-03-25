const mongoose = require('mongoose')
const mongoose_delete = require('mongoose-delete')

const translationSchema = new mongoose.Schema({
    user_id: {
        type: String,
        require: true
    },
    likes: {
        type: Number,
        default: 0
    },
    dislikes: {
        type: Number,
        default: 0
    },
    lines: {
        type: Array,
        require: true
    }
}, {
    timestamps: true
})

translationSchema.plugin(mongoose_delete, { overrideMethods: 'all' })

const Translation = mongoose.model('Translation', translationSchema)

module.exports = Translation