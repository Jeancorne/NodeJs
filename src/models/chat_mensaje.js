const mongoose = require('mongoose')
const { Schema } = mongoose

const chat_mensaje = new Schema({
    id_chat: {type: String, required: true},
    mensaje: {type: String,required: true},
    id_usuarioEnvia:{type: String, required: true},
    name_envia: {type: String}
})


module.exports = mongoose.model('chat_mensaje', chat_mensaje)