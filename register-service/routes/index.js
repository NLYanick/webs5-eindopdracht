const express = require('express');
const router = express.Router({ mergeParams: true });

const passport = require('../../passport-config.js');

const mongoose = require('mongoose');
const Registers = mongoose.model('Registers');

router.post('/', passport.authenticate('jwt', { session: false }), async function(req, res, next) {
  const targetId = req.params.targetId;
  const userUid = req.user.sub;

  if (!targetId) return res.status(400).json({ message: 'Target ID is required' });
  if (!userUid) return res.status(400).json({ message: 'User UID is required' });

  const register = await Registers.create({ 
    targetId, 
    userUid 
  });

  res.status(201).json({ message: 'Successfully registered for service!', register });
});

router.get('/check', passport.authenticate('jwt', { session: false }), async function(req, res, next) {
  const targetId = req.params.targetId;
  const userUid = req.user.sub;

  if (!targetId) return res.status(400).json({ message: 'Target ID is required' });
  if (!userUid) return res.status(400).json({ message: 'User UID is required' });

  const register = await Registers.findOne({ targetId, userUid }).lean();

  if (!register) return res.status(404).json({ message: 'User is not registered for this target' });

  res.status(200).json({ message: 'User is registered', register });
});

module.exports = router;
