const express = require('express');
const router = express.Router({ mergeParams: true });
const multer = require('multer');
const upload = multer();

const circuitBreaker = require('../services/circuit-breaker');

const submissionService = process.env.SUBMISSION_SERVICE;

router.get('/', async (req, res) => {
    try {      
        const { json, status } = await circuitBreaker.fire("get", submissionService, `targets/${req.params.targetId}/submissions`, null, { authorization: req.headers.authorization });

        res.status(status).json(json);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});
router.get('/:filename', async (req, res) => {
    try {
        if (!req.params.filename) return res.status(400).json({ message: 'Photo name is required' });

        const { json, status } = await circuitBreaker.fire("get", submissionService, `targets/${req.params.targetId}/submissions/${req.params.filename}`, null, { authorization: req.headers.authorization });

        res.status(status).json(json);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

router.post('/', upload.single('photo'), async (req, res) => {
    try {
        const form = new FormData();
        
        if (req.file) {
            const blob = new Blob([req.file.buffer], { type: req.file.mimetype });
    
            form.append('photo', blob, req.file.originalname);
        }

        const { json, status } = await circuitBreaker.fire("post", submissionService, `targets/${req.params.targetId}/submissions`, form, { authorization: req.headers.authorization });

        res.status(status).json(json);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

router.delete('/:filename', async (req, res) => {
    try {
        if (!req.params.filename) return res.status(400).json({ message: 'Photo name is required' });

        const { json, status } = await circuitBreaker.fire("delete", submissionService, `targets/${req.params.targetId}/submissions/${req.params.filename}`, null, { authorization: req.headers.authorization });

        res.status(status).json(json);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

module.exports = router;
