const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer();

const circuitBreaker = require('../services/circuit-breaker');

const submissionService = process.env.SUBMISSION_SERVICE;

router.post('/', upload.single('photo'), async (req, res) => {
    try {
        const form = new FormData();
        
        if (req.file) {
            const blob = new Blob([req.file.buffer], { type: req.file.mimetype });
    
            form.append('photo', blob, req.file.originalname);
        }

        if (req.body) Object.keys(req.body).forEach(key => form.append(key, req.body[key]));

        const { json, status } = await circuitBreaker.fire("post", submissionService, "submissions", form, { authorization: req.headers.authorization });

        res.status(status).json(json);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        if (!req.params.id) return res.status(400).json({ message: 'Photo ID is required' });

        const { json, status } = await circuitBreaker.fire("delete", submissionService, `submissions/${req.params.id}`, null, { authorization: req.headers.authorization });

        res.status(status).json(json);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

module.exports = router;
