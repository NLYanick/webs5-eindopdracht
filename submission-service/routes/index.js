const express = require('express');
const router = express.Router({ mergeParams: true });
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

const passport = require('../../passport-config.js');
const roles = require('../services/roles.js');
const uploads = require('../services/uploads.js');
const { publish } = require('../../pubsub.js');

const TargetSubmission = mongoose.model('TargetSubmission');
const TargetId = mongoose.model('TargetId');

router.post('/', uploads.single('photo'), passport.authenticate('jwt', { session: false }), roles.can('participant'), async function (req, res, next) {
  try {
    if (!req.file) return res.status(400).json({ message: 'File is required' });

    const targetId = req.params.targetId;

    const targetIdData = await TargetId.findOne({ targetId: targetId });
    if (!targetIdData) return res.status(404).json({ message: 'Target not found' });

    const imagePath = req.file.filename;

    const submission = await TargetSubmission.create({
      targetId: targetId,
      userUid: req.user.sub,
      imageName: imagePath,
    });

    res.status(201).json({ message: 'Submission uploaded', image_name: imagePath });

    publish('calculate-score', { submission, targetPhotoUrl: targetIdData.photoUrl });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

router.delete('/:filename', passport.authenticate('jwt', { session: false }), roles.can('participant'), async function (req, res, next) {
  try {
    const photoName = req.params.filename;

    if (!photoName) return res.status(400).json({ message: 'Photo name is required' });

    const submissionExists = await TargetSubmission.exists({ imageName: photoName });
    if (!submissionExists) return res.status(404).json({ message: 'Submission not found' });

    await TargetSubmission.findOneAndDelete({ imageName: `${photoName}` });

    const filePath = path.join('public/uploads', photoName);
    fs.unlink(filePath, (err) => {
      if (err) console.error('Error deleting file:', err);
    });

    res.status(204).json({ message: 'Submission deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

router.get('/', passport.authenticate('jwt', { session: false }), roles.can('participant'), async function (req, res, next) {
  try {
    if (!req.user.sub) return res.status(400).json({ message: 'User ID is required' });

    const submissions = await TargetSubmission.find({ userUid: req.user.sub });

    res.status(200).json({
      images: submissions.map(subm => ({
        imageName: subm.imageName,
        targetId: subm.targetId,
        score: subm.score || null
      }))
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});
router.get('/:filename', passport.authenticate('jwt', { session: false }), roles.can('participant'), async function (req, res, next) {
  try {
    const photoName = req.params.filename;
    if (!photoName) return res.status(400).json({ message: 'Photo name is required' });
    
    const submission = await TargetSubmission.findOne({ imageName: photoName });

    if (!submission) return res.status(404).json({ message: 'Submission not found' });

    res.status(200).json({ submission: {
        imageName: submission.imageName,
        targetId: submission.targetId,
        score: submission.score || null
      } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

module.exports = router;
