const mongoose = require('mongoose');

const url = `${process.env.DB_URL}/${process.env.DB_NAME_REGISTER}` || 'mongodb://localhost:27017/mydb';
mongoose.connect(url);

const registersSchema = new mongoose.Schema({
    targetId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Target'
    },
    userUid: {
        type: String,
        required: true
    }
}, { timestamps: true });

mongoose.model('Registers', registersSchema);