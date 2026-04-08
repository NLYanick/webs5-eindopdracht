const mongoose = require('mongoose');

const url = `${process.env.DB_URL}/${process.env.DB_NAME_TARGET}` || 'mongodb://localhost:27017/mydb';
mongoose.connect(url);

const targetSubmissionsSchema = new mongoose.Schema({
    targetId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Target',
        required: true
    },
    userUid: { 
        type: String, 
        ref: 'User',
        required: true
    },
    imageName: { 
        type: String, 
        required: true
    },
    score: Number
}, { timestamps: true });

mongoose.model('TargetSubmission', targetSubmissionsSchema);


const targetIdsSchema = new mongoose.Schema({
    targetId: String,
    photoUrl: String,
    organizerId: String
});

mongoose.model('TargetId', targetIdsSchema);