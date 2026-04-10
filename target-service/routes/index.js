const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

const passport = require('../../passport-config.js');
const roles = require('../services/roles.js');
const uploads = require('../services/uploads.js');

const { publish } = require('../../pubsub');
const { fetchTargetId, isRegistered } = require('../services/middleware.js');
const Target = mongoose.model('Target');
const Votes = mongoose.model('Votes');

router.post('/', uploads.single('target-photo'), passport.authenticate('jwt', { session: false }),async function (req, res) {
    try {        
        if (!req.file) return res.status(400).json({ message: 'File is required' });

        const {
            title,
            city,
            lat,
            lng,
            radiusInMeter,
            endDate
        } = req.body;

        const target = new Target({
            title,
            organizerId: req.user.sub,
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
            city: saved.city,
            lat: saved.lat,
            lng: saved.lng,
            endDate: saved.endDate,
            status: saved.status,
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

        await publish("target.events", { type: "target.deleted", data: target });

        res.status(200).json({ message: 'Target deleted', target });
    } catch (err) {
        if (err.name === 'CastError') {
            return res.status(400).json({ message: 'Invalid target ID' });
        }
        res.status(500).json({ message: 'Internal server error', error: err.message });
    }
});


router.post('/:id/vote', passport.authenticate('jwt', { session: false }), isRegistered, roles.can('target-participant'), async function(req, res) {
    try {
        const targetId = req.params.id;
        const userUid = req.user.sub;
        const { vote } = req.body;

        if (!vote || !['thumbsUp', 'thumbsDown'].includes(vote)) {
            return res.status(400).json({ message: 'Invalid vote. Must be "thumbsUp" or "thumbsDown"' });
        }

        const rating = await Votes.findOneAndUpdate(
            { targetId: targetId, userUid },
            { vote },
            { upsert: true, new: true }
        );

        res.status(200).json({ message: 'Vote saved successfully', vote: rating });

        await publish('target.events', {
            type: 'target.votes.added',
            data: {
                _id: rating._id.toString(),
                targetId,
                userUid,
                vote
            }
        });
    } catch (err) {
        console.error('Error saving vote:', err);
        if (err.name === 'ValidationError') {
            return res.status(400).json({ message: err.message });
        }
        res.status(500).json({ message: 'Internal server error', error: err.message });
    }
});
router.delete('/:id/vote', passport.authenticate('jwt', { session: false }), isRegistered, roles.can('target-participant'), async function(req, res) {
    try {
        const targetId = req.params.id;
        const userUid = req.user.sub;

        const vote = await Votes.findOneAndDelete({ targetId: targetId, userUid });

        res.status(204).send();

        await publish('target.events', {
            type: 'target.votes.removed',
            data: {
                _id: vote._id.toString()
            }
        });
    } catch (err) {
        console.error('Error deleting vote:', err);
        res.status(500).json({ message: 'Internal server error', error: err.message });
    }
});


module.exports = router;
