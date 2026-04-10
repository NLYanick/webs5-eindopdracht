const mongoose = require('mongoose');

const url = `${process.env.DB_URL}/${process.env.DB_NAME_READER}?authSource=admin` || 'mongodb://localhost:27017/mydb';
mongoose.connect(url);

const targetSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    organizerId: { type: String, required: true },
    status: {
        type: String,
        enum: ['OPEN', 'CLOSED'],
        default: 'OPEN',
        index: true
    },
    photoUrl: { type: String, required: false },
    endDate: { type: Date },
    city: { type: String, trim: true },
    lat: { type: Number },
    lng: { type: Number },
    radiusInMeter: { type: Number, default: 500 },
    winner: {type: String, required: false, default: null }
}, { timestamps: true });

mongoose.model('Target', targetSchema);

const submissionsSchema = new mongoose.Schema({
    targetId: { 
        type: mongoose.Schema.Types.ObjectId, 
    },
    userUid: { 
        type: String, 
    },
    photoUrl: { 
        type: String, 
        required: true 
    },
    score: {
        type: Number,
        default: null
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

mongoose.model('Submission', submissionsSchema);

const registersSchema = new mongoose.Schema({
    targetId: String,
    userUid: String
});

mongoose.model('Register', registersSchema);

const votesSchema = new mongoose.Schema({
    targetId: String,
    userUid: String,
    vote: {
        type: String,
        enum: ['thumbsUp', 'thumbsDown'],
    }
});

mongoose.model('Votes', votesSchema);