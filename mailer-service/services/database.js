const mongoose = require('mongoose');
console.log("DbMailer")
const url = `${process.env.DB_URL}/${process.env.DB_NAME_MAILER}` || 'mongodb://localhost:27017/mydb';
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