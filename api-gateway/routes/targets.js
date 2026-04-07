const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer();

const circuitBreaker = require('../services/circuit-breaker');

const targetService = process.env.TARGET_SERVICE;

router.get('/', async (req, res) => {
    try {
        const { json, status } = await circuitBreaker.fire("get", targetService, "targets", null, { authorization: req.headers.authorization });

        res.status(status).json(json);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

router.post('/', upload.single('target-photo'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: 'File is required' });

        const blob = new Blob([req.file.buffer], { type: req.file.mimetype });
        
        const form = new FormData();
        form.append('target-photo', blob, req.file.originalname);

        Object.entries(req.body).forEach(([key, value]) => {
            form.append(key, value);
        });

        const { json, status } = await circuitBreaker.fire("post", targetService, "targets", form, { authorization: req.headers.authorization });

        res.status(status).json(json);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const { json, status } = await circuitBreaker.fire("delete", targetService, `targets/${req.params.id}`, null, { authorization: req.headers.authorization });

        res.status(status).json(json);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

module.exports = router;
