const mongoose = require('mongoose');

const url = `${process.env.DB_URL}/${process.env.DB_NAME_TARGET}` || 'mongodb://localhost:27017/mydb';
mongoose.connect(url);

// const scoreSchema = new mongoose.Schema({

// });

// mongoose.model('Score', scoreSchema);