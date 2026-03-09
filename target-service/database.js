const mongoose = require('mongoose');

const url = `${process.env.DB_URL}/${process.env.DB_NAME}` || 'mongodb://localhost:27017/mydb';
console.log(url);
mongoose.connect(url);

const targetSchema = new mongoose.Schema({

});

mongoose.model('Target', targetSchema);