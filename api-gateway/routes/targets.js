const express = require('express');
const router = express.Router();

const { callService } = require('../utils');

const targetService = process.env.TARGET_SERVICE;

router.get('/', async (req, res) => {
    try {
        const { json, status } = await callService("get", targetService, "targets", null, { authorization: req.headers.authorization });

        res.status(status).json(json);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

module.exports = router;
