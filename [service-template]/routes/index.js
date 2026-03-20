const express = require('express');
const router = express.Router();

const passport = require('../services/passport-config.js');
const roles = require('../services/roles.js');

router.get('/', passport.authenticate('jwt', { session: false }), function(req, res, next) {
  res.json({ message: 'index' });
});

module.exports = router;
