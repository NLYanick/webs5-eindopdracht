const mongoose = require('mongoose');

const url = `${process.env.DB_URL}/${process.env.DB_NAME_SUBMISSION}` || 'mongodb://localhost:27017/mydb';
mongoose.connect(url);

const submissionsSchema = new mongoose.Schema({
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
    photoUrl: { 
        type: String, 
        required: true
    }
}, { timestamps: true });

mongoose.model('Submission', submissionsSchema);


const targetsSchema = new mongoose.Schema({
    status: {
        type: String,
        enum: ['OPEN', 'CLOSED'],
        default: 'OPEN',
        index: true
    },
    organizerId: String
});

mongoose.model('Target', targetsSchema);


const registersSchema = new mongoose.Schema({
    targetId: String,
    userUid: String
});

mongoose.model('Register', registersSchema);