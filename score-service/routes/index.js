const express = require('express');
const router = express.Router();

const passport = require('../../passport-config.js');
const roles = require('../services/roles.js');

const { publish } = require('../../pubsub');

router.get('/', passport.authenticate('jwt', { session: false }), roles.can('test'), function(req, res, next) {
  res.json({ message: 'score index' });
});

module.exports = router;
