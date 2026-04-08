const mongoose = require('mongoose');

const url = `${process.env.DB_URL}/${process.env.DB_NAME_SUBMISSION}` || 'mongodb://localhost:27017/mydb';
mongoose.connect(url);

const submissionsSchema = new mongoose.Schema({
    targetId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Target' 
    },
    userUid: { 
        type: String, 
        ref: 'User' 
    },
    photoUrl: { 
        type: String, 
        required: true 
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

mongoose.model('Submission', submissionsSchema);


const targetsSchema = new mongoose.Schema({
    status: {
        type: String,
        enum: ['OPEN', 'CLOSED'],
        default: 'OPEN',
        index: true
    },
});

mongoose.model('Target', targetsSchema);