const mongoose = require('mongoose')

const { Schema } = mongoose
var aggregatePaginate = require('mongoose-aggregate-paginate-v2');
const storageProduct = new Schema({
    NombrePro: {type: String, required: true},
    DescripcionPro: {type: String, required: true},
    PrecioPro:{type: String, required:true},
    Tipo :{type: String, required:true},
    Categoria:{type: String, required:true},
    Marca: {type: String, required:true},
    ImgPro:{type: String, required:true}
})

storageProduct.plugin(aggregatePaginate);



module.exports = mongoose.model('storageProduct', storageProduct)


