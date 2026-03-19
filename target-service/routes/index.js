const express = require('express');
const router = express.Router();

const passport = require('../passport-config.js');
const roles = require('../roles.js');

router.get('/', passport.authenticate('jwt', { session: false }), function(req, res, next) {
  res.json({ message: 'index' });
});

module.exports = router;
