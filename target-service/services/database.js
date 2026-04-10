const mongoose = require('mongoose');
console.log("DbTarget")
const url = `${process.env.DB_URL}/${process.env.DB_NAME_SUBMISSION}?authSource=admin` || 'mongodb://localhost:27017/mydb';
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
    endDate: { type: Date, default: () => new Date(Date.now() + 60 * 60 * 1000) },
    city: { type: String, trim: true },
    lat: { type: Number },
    lng: { type: Number },
    radiusInMeter: { type: Number, default: 500 },
}, { timestamps: true });

mongoose.model('Target', targetSchema);

const votesSchema = new mongoose.Schema({
    targetId: {
        type: String,
        required: true,
    },
    userUid: {
        type: String,
        required: true
    },
    vote: {
        type: String,
        enum: ['thumbsUp', 'thumbsDown'],
        required: true
    }
});

mongoose.model('Votes', votesSchema);

const registersSchema = new mongoose.Schema({
    targetId: String,
    userUid: String
});

mongoose.model('Register', registersSchema);