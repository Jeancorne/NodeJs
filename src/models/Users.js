const mongoose = require('mongoose')
const { Schema } = mongoose
const bcrypt = require('bcryptjs')
var salt = bcrypt.genSaltSync();
//var passHash = hashPwd(salt,data.Password);
const saltRounds = 10;

const UserSchema = new Schema({
    name: {type: String, required: true},
    email: {type: String, required: true},
    password:{type: String, required: true},
    role:{type: String, required: true},
    date: {type: Date, default: Date.now}
})

UserSchema.methods.encryptPass = async function(password){
    const salt = await bcrypt.genSalt(10)
    const hash = bcrypt.hash(password, salt)
    return hash
}

UserSchema.methods.validPassword = function (password) {
  return bcrypt.compareSync(password, this.password);
};


module.exports = mongoose.model('Users', UserSchema)