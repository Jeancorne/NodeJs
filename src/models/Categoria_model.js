const mongoose = require('mongoose')
const { Schema } = mongoose

const model_categoria = new Schema({
    Nombre_categoria: {type: String, required: true}
})


module.exports = mongoose.model('model_categoria', model_categoria)