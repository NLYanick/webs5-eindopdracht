const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const passport = require('../../passport-config.js');
const roles = require('../services/roles.js');

const { publish } = require('../../pubsub');

router.get('/:targetId', passport.authenticate('jwt', { session: false }), roles.can('participant'), function(req, res, next) {
  const targetId = req.params.targetId;

  // TODO Check in submission-service if there are any submissions for this targetId, if not return 404 

  // TODO return all submission scores and image names

  res.json({ message: 'score index', targetId });
});

module.exports = router;
