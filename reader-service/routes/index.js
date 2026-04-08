const express = require('express');
const router = express.Router();

const passport = require('../../passport-config.js');
const roles = require('../services/roles.js');

require('../services/database.js');
const mongoose = require('mongoose');
const Target = mongoose.model('Target');
const Submission = mongoose.model('Submission');

// GET /reader/targets - list targets, filterable by city or lat/lng
router.get('/targets', passport.authenticate('jwt', { session: false }), async function (req, res, next) {
    try {
        const { city, lat, lng } = req.query;

        let filter = {};

        if (city) {
            filter.city = { $regex: city, $options: 'i' };
        }

        let targets = await Target.find(filter);
        if (lat && lng) {
            const latF = parseFloat(lat);
            const lngF = parseFloat(lng);

            targets = targets.filter(target => {
                const distanceInMeters = getDistanceInMeters(latF, lngF, target.lat, target.lng);
                return distanceInMeters <= target.radiusInMeter;
            });
        }

        if (targets.length === 0) {
            return res.status(404).json({ message: 'No targets found' });
        }

        res.status(200).json(targets);
    } catch (err) {
        res.status(500).json({ message: 'Internal server error', error: err.message });
    }
});

// GET /reader/targets/:id/submissions - get all submissions for a target
router.get('/targets/:id/submissions', passport.authenticate('jwt', { session: false }), async function (req, res, next) {
    try {
        const submissions = await Submission.find({ targetId: req.params.id });
        res.status(200).json({ submissions });
    } catch (err) {
        res.status(500).json({ message: 'Internal server error', error: err.message });
    }
});

// GET /reader/targets/:id/submissions/my - get current user's submissions for a target
router.get('/targets/:id/submissions/my', passport.authenticate('jwt', { session: false }), async function (req, res, next) {
    try {
        const submissions = await Submission.find({
            targetId: req.params.id,
            userUid: req.user.sub
        });
        res.status(200).json({ submissions });
    } catch (err) {
        res.status(500).json({ message: 'Internal server error', error: err.message });
    }
});

// GET /reader/targets/:id/submissions/my - get current user's submissions for a target
router.get('/targets/:id/submissions/:fileName', passport.authenticate('jwt', { session: false }), async function (req, res, next) {
    try {
    const photoUrl = req.params.fileName;
    if (!photoUrl) return res.status(400).json({ message: 'Photo url is required' });
    
    const submission = await Submission.findOne({ photoUrl: photoUrl });

    if (!submission) return res.status(404).json({ message: 'Submission not found' });

    res.status(200).json({ submission: {
        imageName: submission.imageName,
        targetId: submission.targetId,
        score: submission.score || null
        } 
    });
    } 
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// GET /reader/scores/:targetId
router.get('/scores/:targetId', passport.authenticate('jwt', { session: false }), async function (req, res, next) {
    try {
        const submissions = await Submission.find({ targetId: req.params.targetId });
        res.status(200).json({
            scores: submissions.map(sub => ({
                score: sub.score,
                userUid: sub.userUid
            }))
        });
    } catch (err) {
        res.status(500).json({ message: 'Internal server error', error: err.message });
    }
});

function getDistanceInMeters(lat1, lng1, lat2, lng2) {
    const R = 6371000;
    const toRad = deg => deg * (Math.PI / 180);
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);
    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
        Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

module.exports = router;