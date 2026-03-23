const express = require('express');
const router = express.Router();

const passport = require('../services/passport-config.js');
const roles = require('../services/roles.js');

const { publish } = require('../../pubsub');
const Target = require("../services/database.js")

router.get('/', passport.authenticate('jwt', { session: false }), async function(req, res, next) {
    try {
        const { city, lat, lng } = req.query;

        let filter = {};

        if (city) {
            filter.city = { $regex: city, $options: 'i' }; // case-insensitive
        }

        if (lat && lng) {
            filter.lat = { $gte: parseFloat(lat) - radius, $lte: parseFloat(lat) + radius };
            filter.lng = { $gte: parseFloat(lng) - radius, $lte: parseFloat(lng) + radius };
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

router.post('/', passport.authenticate('jwt', { session: false }), async function(req, res, next) {
    try {
        const { title, organizerId, photoUrl, city, lat, lng, radiusInMeter } = req.body;

        const target = new Target({
            title,
            organizerId,
            photoUrl,
            city,
            lat,
            lng,
            radiusInMeter
        });

        const saved = await target.save();

        publish("Target-Queue", { message: "create target", target: saved });

        res.status(201).json(saved);
    } catch (err) {
        if (err.name === 'ValidationError') {
            return res.status(400).json({ message: err.message });
        }
        res.status(500).json({ message: 'Internal server error', error: err.message });
    }
});

router.delete('/:id', passport.authenticate('jwt', { session: false }), async function(req, res, next) {
    try {
        const target = await Target.findByIdAndDelete(req.params.id);

        if (!target) {
            return res.status(404).json({ message: 'Target not found' });
        }

        publish("Target-Queue", { message: "delete target", target });

        res.status(200).json({ message: 'Target deleted', target });
    } catch (err) {
        if (err.name === 'CastError') {
            return res.status(400).json({ message: 'Invalid target ID' });
        }
        res.status(500).json({ message: 'Internal server error', error: err.message });
    }
});
// publish("Test-Queue", { message: "RabbitMQ Test" })
module.exports = router;
