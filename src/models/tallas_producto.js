const mongoose = require('mongoose')

const { Schema } = mongoose

const tallas_producto = new Schema({
    id_producto: {type: String, required: true},
    talla: {type: String, required: true},
    Cantidad:{type: String, required:true}    
})

module.exports = mongoose.model('tallas_producto', tallas_producto)

