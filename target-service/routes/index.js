const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const passport = require('../../passport-config.js');
const roles = require('../services/roles.js');
const uploads = require('../services/uploads.js');

const { publish } = require('../../pubsub');
const Target = require("../services/database.js");
const { fetchTargetId } = require('../services/middleware.js');

router.get('/', passport.authenticate('jwt', { session: false }), async function(req, res, next) {
    try {
        const { city, lat, lng } = req.query;

        let filter = {};

        if (city) {
            filter.city = { $regex: city, $options: 'i' };
        }

        if (lat && lng) {
            filter.lat = { $gte: parseFloat(lat) - radiusInMeter, $lte: parseFloat(lat) + radiusInMeter };
            filter.lng = { $gte: parseFloat(lng) - radiusInMeter, $lte: parseFloat(lng) + radiusInMeter };
        }

        const targets = await Target.find(filter);

        if (targets.length === 0) {
            return res.status(404).json({ message: 'No targets found' });
        }

        res.status(200).json(targets);
    } catch (err) {
        res.status(500).json({ message: 'Internal server error', error: err.message });
    }
});


router.post('/', uploads.single('target-photo'), passport.authenticate('jwt', { session: false }),async function (req, res) {
    try {        
        if (!req.file) return res.status(400).json({ message: 'File is required' });
        
        const {
            title,
            organizerId,
            city,
            lat,
            lng,
            radiusInMeter,
            endDate
        } = req.body;

        const target = new Target({
            title,
            organizerId,
            photoUrl: req.file.filename,
            city,
            lat,
            lng,
            radiusInMeter,
            endDate: endDate || undefined
        });

        const saved = await target.save();

        await publish("target.events", {
            type: "target.created",
            data: {
                id: saved._id.toString(),
                title: saved.title,
                organizerId: saved.organizerId,
                photoUrl: saved.photoUrl,
                endDate: saved.endDate,
                status: "open",
            }
        });

        return res.status(201).json(saved);

    } catch (err) {
        if (err.name === 'ValidationError') {
            return res.status(400).json({ message: err.message });
        }

        console.error("POST /target error:", err);
        res.status(500).json({
            message: 'Internal server error',
            error: err.message
        });
    }
});


router.delete('/:id', passport.authenticate('jwt', { session: false }), fetchTargetId, roles.can('target-owner'), async function(req, res, next) {
    try {
        const target = await Target.findByIdAndDelete(req.params.id);

        if (!target) {
            return res.status(404).json({ message: 'Target not found' });
        }

        const filePath = path.join('public/uploads', target.photoUrl);
        fs.unlink(filePath, (err) => {
            if (err) console.error('Error deleting file:', err);
        });

        await publish("target.events", { type: "target.deleted", target });

        res.status(200).json({ message: 'Target deleted', target });
    } catch (err) {
        if (err.name === 'CastError') {
            return res.status(400).json({ message: 'Invalid target ID' });
        }
        res.status(500).json({ message: 'Internal server error', error: err.message });
    }
});

module.exports = router;
