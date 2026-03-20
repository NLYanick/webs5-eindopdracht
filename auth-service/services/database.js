const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

const url = `${process.env.DB_URL}/${process.env.DB_NAME_AUTH}` || 'mongodb://localhost:27017/mydb';
mongoose.connect(url);

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        unique: true,
        required: true,
    },
    password: {
        type: String,
        unique: true,
        required: true,
        select: false
    },
    role: String,
    uid: { 
        type: String, 
        unique: true, 
        default: uuidv4 
    }
});

userSchema.pre('save', async function () {
    if (!this.isModified('password')) return;

    try {
        this.password = await bcrypt.hash(this.password, 10);
    } catch (err) {
        throw err;
    }
});

mongoose.model('User', userSchema);


const tokenStoreSchema = new mongoose.Schema({
    opaqueToken: String,
    originalJwt: String,
    userUid: { 
        type: String, 
        ref: 'User',
        required: true 
    },
    createdAt: { 
        type: Date, 
        default: Date.now, 
        expires: 86400 
    }
});

mongoose.model('TokenStore', tokenStoreSchema);
