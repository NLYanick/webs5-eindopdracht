const express = require('express');
const router = express.Router({ mergeParams: true });
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

const passport = require('../../passport-config.js');
const roles = require('../services/roles.js');
const uploads = require('../services/uploads.js');
const { publish } = require('../../pubsub.js');

const Submission = mongoose.model('Submission');
const Target = mongoose.model('Target');

router.post('/', uploads.single('photo'), passport.authenticate('jwt', { session: false }), async function (req, res, next) {
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
      imageName: imagePath,
    });

    await publish('submission.events', {type: "submission.created", data: submission });

    res.status(201).json({ message: 'Submission uploaded', image_name: imagePath });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

router.delete('/:filename', passport.authenticate('jwt', { session: false }), async function (req, res, next) {
  try {
    const photoName = req.params.filename;

    if (!photoName) return res.status(400).json({ message: 'Photo name is required' });

    const existingSubmission = await Submission.findOne({ imageName: photoName });
    if (!existingSubmission) return res.status(404).json({ message: 'Submission not found' });

    if(existingSubmission.userUid != req.user.sub){
      const target = await Target.findById(existingSubmission.targetId);

      if(!target || target.organizerId != req.user.sub){
        return res.status(403).json({ message: 'Unauthorized to remove this submission' });
      }
    }

    const submission = await Submission.deleteMany({_id: existingSubmission._id});

    const filePath = path.join('public/uploads', photoName);
    fs.unlink(filePath, (err) => {
      if (err) console.error('Error deleting file:', err);
    });
    if(submission){
      await publish('submission.events', {type: "submission.deleted", data: existingSubmission });
    }
    res.status(204).json({ message: 'Submission deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

module.exports = router;
