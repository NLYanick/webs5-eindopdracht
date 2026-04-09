const mongoose = require('mongoose');

const url = `${process.env.DB_URL}/${process.env.DB_NAME_READER}` || 'mongodb://localhost:27017/mydb';
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
    radiusInMeter: { type: Number, default: 500 }
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