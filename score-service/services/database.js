const mongoose = require('mongoose');

const url = `${process.env.DB_URL}/${process.env.DB_NAME_TARGET}` || 'mongodb://localhost:27017/mydb';
mongoose.connect(url);

const scoreSchema = new mongoose.Schema({
    targetId: String,
    submissionId: String,
    score: int,
}, { timestamps: true });

const targetSchema = new mongoose.Schema({
    photoUrl: { type: String, required: false },
}, { timestamps: true });

mongoose.model('Target', targetSchema);
mongoose.model('Score', scoreSchema);