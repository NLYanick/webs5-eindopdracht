const express = require('express');
const circuitBreaker = require('../circuit-breaker');

const router = new express.Router();

const authService = process.env.AUTH_SERVICE;

router.post('/login', async (req, res) => {
    try {
        const body = req.body;
        if (!body) return res.status(400).json({ message: 'body is leeg!' });

        const { json, status } = await circuitBreaker.fire("post", authService, 'auth/login', body);

        res.status(status).json(json);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

router.post('/register', async (req, res) => {
    try {
        const body = req.body;
        if (!body) return res.status(400).json({ message: 'body is leeg!' });

        const { json, status } = await circuitBreaker.fire("post", authService, 'auth/register', body);

        res.status(status).json(json);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

module.exports = router;