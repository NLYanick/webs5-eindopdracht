const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const passport = require('../../passport-config.js');
const roles = require('../services/roles.js');
const uploads = require('../services/uploads.js');

const TargetSubmission = mongoose.model('TargetSubmission');

router.post('/', uploads.single('photo'), passport.authenticate('jwt', { session: false }), roles.can('participant'), async function (req, res, next) {
  try {
    if(!req.file) return res.status(400).json({ message: 'File is required' });

    const imagePath = `/api/v1/uploads/${req.file.filename}`;

    await TargetSubmission.create({
      targetId: req.body.targetId,
      userUid: req.user.sub,
      imageUrl: imagePath,
    });

    res.status(201).json({ message: 'Submission uploaded' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

router.delete('/:id', passport.authenticate('jwt', { session: false }), roles.can('participant'), async function (req, res, next) {
  try {
    const photoId = req.params.id;

    if (!photoId) return res.status(400).json({ message: 'Photo ID is required' });

    await TargetSubmission.findByIdAndDelete(photoId);

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

    res.status(200).json({ image_paths: submissions.map(subm => subm.imageUrl) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

module.exports = router;
