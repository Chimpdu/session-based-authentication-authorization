const mongoose = require('mongoose');
const schema = mongoose.Schema;
let userSchema = new schema({
    username: String,
    password: String
});
module.exports = mongoose.model('user', userSchema);