const mongoose = require("mongoose");

const url = `${process.env.DB_URL}/${process.env.DB_NAME_SCORE}` || 'mongodb://localhost:27017/mydb';
mongoose.connect(url);

const scoreSchema = new mongoose.Schema({
    targetId: String,
    submissionId: String,
    userUid: String,
    score: Number,
}, { timestamps: true });

mongoose.model('Score', scoreSchema);


const targetSchema = new mongoose.Schema({
    photoUrl: { type: String, required: false },
    organizerId: String
}, { timestamps: false });

mongoose.model('Target', targetSchema);


const registersSchema = new mongoose.Schema({
    targetId: String,
    userUid: String
});

mongoose.model('Register', registersSchema);