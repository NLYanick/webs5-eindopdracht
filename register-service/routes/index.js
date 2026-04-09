const express = require('express');
const router = express.Router({ mergeParams: true });

const passport = require('../../passport-config.js');
const { publish } = require('../../pubsub.js');

const mongoose = require('mongoose');
const Registers = mongoose.model('Register');

router.post('/', passport.authenticate('jwt', { session: false }), async function (req, res, next) {
  try {
    const targetId = req.params.targetId;
    const userUid = req.user.sub;

    if (!targetId) return res.status(400).json({ message: 'Target ID is required' });
    if (!userUid) return res.status(400).json({ message: 'User UID is required' });

    const existingRegister = await Registers.findOne({ targetId, userUid }).lean();
    if (existingRegister) return res.status(400).json({ message: 'User is already registered for this target' });

    const register = await Registers.create({
      targetId,
      userUid
    });

    res.status(201).json({ message: 'Successfully registered for service!', register });

    publish('register.events', { type: 'register.created', data: register });
  } catch (error) {
    console.error("Error creating register:", error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});
router.delete('/', passport.authenticate('jwt', { session: false }), async function (req, res, next) {
  try {
    const targetId = req.params.targetId;
    const userUid = req.user.sub;

    if (!targetId) return res.status(400).json({ message: 'Target ID is required' });
    if (!userUid) return res.status(400).json({ message: 'User UID is required' });

    const existingRegister = await Registers.findOne({ targetId, userUid }).lean();
    if (!existingRegister) return res.status(400).json({ message: 'User is not registered for this target' });

    const register = await Registers.findOneAndDelete({
      targetId,
      userUid
    });

    res.status(204).send();

    if (register) {
      publish('register.events', { type: 'register.deleted', data: register });
    }
  } catch (error) {
    console.error("Error deleting register:", error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

router.get('/check', passport.authenticate('jwt', { session: false }), async function (req, res, next) {
  try {
    const targetId = req.params.targetId;
    const userUid = req.user.sub;

    if (!targetId) return res.status(400).json({ message: 'Target ID is required' });
    if (!userUid) return res.status(400).json({ message: 'User UID is required' });

    const register = await Registers.findOne({ targetId, userUid }).lean();

    if (!register) return res.status(404).json({ message: 'User is not registered for this target' });

    res.status(200).json({ message: 'User is registered', register });
  } catch (error) {
    console.error("Error checking registration:", error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

module.exports = router;
