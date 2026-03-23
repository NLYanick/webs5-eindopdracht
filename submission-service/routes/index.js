const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

const passport = require('../../passport-config.js');
const roles = require('../services/roles.js');
const uploads = require('../services/uploads.js');

const TargetSubmission = mongoose.model('TargetSubmission');

router.post('/', uploads.single('photo'), passport.authenticate('jwt', { session: false }), roles.can('participant'), async function (req, res, next) {
  try {
    if(!req.file) return res.status(400).json({ message: 'File is required' });

    const imagePath = req.file.filename;

    await TargetSubmission.create({
      targetId: req.body.targetId,
      userUid: req.user.sub,
      imageName: imagePath,
    });

    res.status(201).json({ message: 'Submission uploaded', image_name: imagePath });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

router.delete('/:filename', passport.authenticate('jwt', { session: false }), roles.can('participant'), async function (req, res, next) {
  try {
    const photoName = req.params.filename;

    if (!photoName) return res.status(400).json({ message: 'Photo name is required' });

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

    res.status(200).json({ image_paths: submissions.map(subm => subm.imageName) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

module.exports = router;
