const mongoose = require('mongoose')
const { Schema } = mongoose

const chat = new Schema({
    id_chat: {type: String, required: true},
    name_envia: {type: String}
})


module.exports = mongoose.model('chat', chat)