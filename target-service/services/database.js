const mongoose = require('mongoose');

const url = `${process.env.DB_URL}/${process.env.DB_NAME_TARGET}` || 'mongodb://localhost:27017/mydb';
mongoose.connect(url);

const targetSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    organizerId: { type: String, required: true },
    photoUrl: { type: String, required: false },
    endDate: { type: Date, default: () => new Date(Date.now() + 60 * 60 * 1000) },
    city: { type: String, trim: true },
    lat: { type: Number },
    lng: { type: Number },
    radiusInMeter: { type: Number, default: 500 }
}, { timestamps: true });

module.exports = mongoose.model('Target', targetSchema);