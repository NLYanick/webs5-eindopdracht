const express = require('express');
const router = express.Router();

const passport = require('../../passport-config.js');
const roles = require('../services/roles.js');

const Target = require("../services/database.js")

router.get('/targets', passport.authenticate('jwt', { session: false }), async function(req, res, next) {
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

module.exports = router;
