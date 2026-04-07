const express = require('express');
const router = express.Router({ mergeParams: true });

const passport = require('../../passport-config.js');

const { publish } = require('../../pubsub.js');

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

  res.json({ message: 'Successfully registered for service!', register });
});

module.exports = router;
