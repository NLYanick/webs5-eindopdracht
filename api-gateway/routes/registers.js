const express = require('express');
const router = express.Router({ mergeParams: true });

const circuitBreaker = require('../services/circuit-breaker');

const registerService = process.env.REGISTER_SERVICE;

router.post('/', async (req, res) => {
    try {
        if (!req.params.targetId) return res.status(400).json({ message: 'Target ID is required' });

        const { json, status } = await circuitBreaker.fire("post", registerService, `targets/${req.params.targetId}/registers`, null, { authorization: req.headers.authorization });

        res.status(status).json(json);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

module.exports = router;
