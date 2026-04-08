const express = require('express');
const router = express.Router({ mergeParams: true });
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

const passport = require('../../passport-config.js');
const roles = require('../services/roles.js');
const uploads = require('../services/uploads.js');
const { publish } = require('../../pubsub.js');
const { isRegistered, fetchTargetId, isRegisteredAndFetchTargetId } = require('../services/middleware.js');

const Submission = mongoose.model('Submission');
const Target = mongoose.model('Target');

router.post('/', passport.authenticate('jwt', { session: false }), isRegistered, roles.can('target-participant'), uploads.single('photo'), async function (req, res, next) {
  try {
    if (!req.file) return res.status(400).json({ message: 'File is required' });

    const targetId = req.params.targetId;
    const target = await Target.findOne({ _id: targetId });
    if (!target) return res.status(404).json({ message: 'Target not found' });
    if (target.status === 'CLOSED') return res.status(400).json({ message: 'Target closed' });

    const imagePath = req.file.filename;

    const submission = await Submission.create({
      targetId: targetId,
      userUid: req.user.sub,
      photoUrl: imagePath,
    });

    await publish('submission.events', {type: "submission.created", data: submission });

    res.status(201).json({ message: 'Submission uploaded', image_name: imagePath });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

router.delete('/:filename', passport.authenticate('jwt', { session: false }), isRegisteredAndFetchTargetId, roles.can('submission-deleter'), async function (req, res, next) {
  try {
    const photoName = req.params.filename;

    if (!photoName) return res.status(400).json({ message: 'Photo name is required' });

    const submissionExists = await Submission.exists({ photoUrl: photoName });
    if (!submissionExists) return res.status(404).json({ message: 'Submission not found' });

    const submission = await Submission.findOneAndDelete({ photoUrl: photoName });

    const filePath = path.join('public/uploads', photoName);
    fs.unlink(filePath, (err) => {
      if (err) console.error('Error deleting file:', err);
    });

    if(submission){
      await publish('submission.events', {type: "submission.deleted", data: submission });
    }
    
    res.status(204).json({ message: 'Submission deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

router.get('/', passport.authenticate('jwt', { session: false }), fetchTargetId, roles.can('target-owner'), async function (req, res, next) {
  try {
    const targetId = req.params.targetId;
    const submissions = await Submission.find({ targetId: targetId });

    res.status(200).json({
      images: submissions.map(subm => ({
        photoUrl: subm.photoUrl,
        targetId: subm.targetId,
        score: subm.score || null,
        userUid: subm.userUid
      }))
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

router.get('/user', passport.authenticate('jwt', { session: false }), isRegistered, roles.can('target-participant'), async function (req, res, next) {
  try {
    if (!req.user.sub) return res.status(400).json({ message: 'User ID is required' });

    const targetId = req.params.targetId;
    const submissions = await Submission.find({ userUid: req.user.sub, targetId: targetId });

    res.status(200).json({
      images: submissions.map(subm => ({
        photoUrl: subm.photoUrl,
        targetId: subm.targetId,
        score: subm.score || null
      }))
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

router.get('/:filename', passport.authenticate('jwt', { session: false }), isRegistered, roles.can('target-participant'), async function (req, res, next) {
  try {
    const photoName = req.params.filename;
    if (!photoName) return res.status(400).json({ message: 'Photo name is required' });
    
    const submission = await Submission.findOne({ photoUrl: photoName });

    if (!submission) return res.status(404).json({ message: 'Submission not found' });

    res.status(200).json({ submission: {
        photoUrl: submission.photoUrl,
        targetId: submission.targetId,
        score: submission.score || null
      } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

module.exports = router;
