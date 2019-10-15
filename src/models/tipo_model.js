const mongoose = require('mongoose')
const { Schema } = mongoose

const model_tipo = new Schema({
    Nombre_tipo: {type: String, required: true}
})


module.exports = mongoose.model('model_tipo', model_tipo)