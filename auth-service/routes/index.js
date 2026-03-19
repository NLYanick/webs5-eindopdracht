const express = require('express');
const router = new express.Router();

const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const mongoose = require('mongoose');

const User = mongoose.model('User');
const TokenStore = mongoose.model('TokenStore');

router.post('/login', async (req, res) => {
    const { username } = req.body;
    const user = await User.findOne({ username });

    if(!user) 
        return res.status(400).json({ message: 'Invalid Credentials' });

    const payload = {
        sub: user.uid,
        role: user.role,
        apiKey: process.env.API_KEY
    }
    
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '24h' });
    const opaqueToken = crypto.randomBytes(32).toString('hex');

    await TokenStore.create({ 
        opaqueToken: opaqueToken, 
        originalJwt: token 
    });

    res.status(200).json({ token: opaqueToken });
});

router.post('/register', async (req, res) => {
    const { username } = req.body;

    if(!username) 
        return res.status(400).json({ message: 'Invalid Credentials' });

    const user = await User.create({
        username: username,
        role: "",
    });

    const payload = {
        sub: user.uid,
        role: user.role,
        apiKey: process.env.API_KEY
    }

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '24h' });
    const opaqueToken = crypto.randomBytes(32).toString('hex');

    await TokenStore.create({ 
        opaqueToken: opaqueToken, 
        originalJwt: token 
    });

    res.status(200).json({ token: opaqueToken });
});

router.post('/check', async (req, res) => {
    const opaqueToken = req.body.opaqueToken;

    const tokenData = await TokenStore.findOne({ opaqueToken });

    if(!tokenData) return res.status(400).json({ message: "Invalid token" });

    res.status(200).json({ token: tokenData.originalJwt });
});

module.exports = router;