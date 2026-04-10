const mongoose = require('mongoose');
console.log("DbMailer")
const url = `${process.env.DB_URL}/${process.env.DB_NAME_SUBMISSION}?authSource=admin` || 'mongodb://localhost:27017/mydb';
mongoose.connect(url);

const userSchema = new mongoose.Schema({
    uid: { type: String, required: true, unique: true },
    username: { type: String, default: "User" },
    email: { type: String, required: true },
});

mongoose.model('User', userSchema);

const targetSchema = new mongoose.Schema({
    endDate: { type: Date, default: () => new Date(Date.now() + 60 * 60 * 1000) }
});

mongoose.model('Target', targetSchema);

const registerSchema = new mongoose.Schema({
    targetId: { type: mongoose.Schema.Types.ObjectId, required: true },
    userUid: { type: String, required: true, ref: 'User' },
    hasSubmitted: { type: Boolean, default: false }
});
mongoose.model('Register', registerSchema);