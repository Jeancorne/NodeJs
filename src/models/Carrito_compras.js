const mongoose = require('mongoose')
const { Schema } = mongoose

const carrito_usuario = new Schema({
    id_user: {type: String, required: true},
    id_producto: {type: String,required: true}    
})


module.exports = mongoose.model('carrito_usuario', carrito_usuario)