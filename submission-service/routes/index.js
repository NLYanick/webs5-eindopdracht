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

    const imagePath = `/api/v1/public/uploads/${req.file.filename}`;

    await TargetSubmission.create({
      targetId: req.body.targetId,
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

    // Perform delete operation here
    await TargetSubmission.findByIdAndDelete(photoId);

    res.status(204).json({ message: 'Submission deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

module.exports = router;
