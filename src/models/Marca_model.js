const mongoose = require('mongoose')
const { Schema } = mongoose

const model_marca = new Schema({
    Nombre_marca: {type: String, required: true}
})


module.exports = mongoose.model('model_marca', model_marca)