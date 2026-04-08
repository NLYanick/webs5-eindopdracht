const express = require('express');
const router = express.Router();

const circuitBreaker = require('../services/circuit-breaker');

const readerService = process.env.READER_SERVICE;

router.get('/:targetId', async (req, res) => {
    try {
        if (!req.params.targetId) return res.status(400).json({ message: 'Target ID is required' });

        const { json, status } = await circuitBreaker.fire("get", readerService, `reader/scores/${req.params.targetId}`, null, { authorization: req.headers.authorization });

        res.status(status).json(json);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

module.exports = router;