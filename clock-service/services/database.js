const mongoose = require('mongoose');

const url = `${process.env.DB_URL}/${process.env.DB_NAME_SUBMISSION}?authSource=admin` || 'mongodb://localhost:27017/mydb';
mongoose.connect(url);

const timerSchema = new mongoose.Schema({
    _id: String,
    closeAt: { type: Date, required: true },
    lastReminderAt: { type: Date, default: Date.now() }
});

module.exports = mongoose.model('Timer', timerSchema);