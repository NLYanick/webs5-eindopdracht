const mongoose = require('mongoose');

const url = `${process.env.DB_URL}/${process.env.DB_NAME_TARGET}` || 'mongodb://localhost:27017/mydb';
mongoose.connect(url);

const targetSubmissionsSchema = new mongoose.Schema({
    targetId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Target' 
    },
    imageUrl: { 
        type: String, 
        required: true 
    },
    score: Number,
});

mongoose.model('TargetSubmission', targetSubmissionsSchema);