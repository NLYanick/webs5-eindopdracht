const express = require('express');
const router = express.Router();

const passport = require('../../passport-config.js');
const roles = require('../services/roles.js');

const { publish } = require('../../pubsub');

router.get('/', passport.authenticate('jwt', { session: false }), function(req, res, next) {
  res.json({ message: 'index' });

  publish("Test-Queue", { message: "RabbitMQ Test" })
});

module.exports = router;
