const express = require('express');
const router = new express.Router();

const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');

const User = mongoose.model('User');
const TokenStore = mongoose.model('TokenStore');

router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ username }).select('+password');

    if(!user || !(await bcrypt.compare(password, user.password))) 
        return res.status(401).json({ message: 'Invalid Credentials' });

    const opaqueToken = await generateAndStoreToken(user);

    res.status(200).json({ token: opaqueToken });
});

router.post('/register', async (req, res) => {
    const { username, password } = req.body;

    if(!username || !password) return res.status(401).json({ message: 'Invalid Credentials' });

    const existingUser = await User.findOne({ username });
    if(existingUser) return res.status(400).json({ message: 'Username already exists. Please choose a different username.' });

    const user = await User.create({
        username: username,
        password: password,
        roles: [],
    });

    const opaqueToken = await generateAndStoreToken(user);

    res.status(200).json({ token: opaqueToken });
});

router.post('/receive-jwt', async (req, res) => {
    const opaqueToken = req.body.opaqueToken;

    const tokenData = await TokenStore.findOne({ opaqueToken });

    if(!tokenData) return res.status(400).json({ message: "Invalid token" });

    res.status(200).json({ token: tokenData.originalJwt });
});


async function generateAndStoreToken(user) {
    const payload = {
        sub: user.uid,
        roles: user.roles,
        apiKey: process.env.API_KEY
    }

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '24h' });
    const opaqueToken = crypto.randomBytes(32).toString('hex');

    // Update the token or create a new one
    const tokenData = await TokenStore.findOne({ userUid: user.uid });
    if (tokenData) {
        await TokenStore.updateOne(
            { userUid: user.uid },
            {
                $set: {
                    opaqueToken: opaqueToken,
                    originalJwt: token
                }
            }
        );
    } else {
        await TokenStore.create({
            opaqueToken: opaqueToken,
            originalJwt: token,
            userUid: user.uid
        });
    }

    return opaqueToken;
}


module.exports = router;