const express = require('express');
const router = express.Router();

const passport = require('../../passport-config.js');
const roles = require('../services/roles.js');
const circuitBreaker = require('../services/circuit-breaker.js');

const SUBMISSION_SERVICE = process.env.SUBMISSION_SERVICE;

router.get('/:targetId', passport.authenticate('jwt', { session: false }), roles.can('participant'), async (req, res, next) => {
  const targetId = req.params.targetId;

  const { json, status } = await circuitBreaker.fire("get", SUBMISSION_SERVICE, `targets/${targetId}/submissions`, null, { authorization: req.headers.authorization })
  
  if(!json || status !== 200) return res.status(404).json({ message: 'No scores found for this target' });

  res.json({ message: 'Successfully retrieved scores', images: json.images.map(image => ({ name: image.imageName, score: image.score, userUid: image.userUid })) });
});
router.get('/:targetId/my-submissions', passport.authenticate('jwt', { session: false }), roles.can('participant'), async (req, res, next) => {
  const userUid = req.user.sub;
  if (!userUid) return res.status(401).json({ message: 'Unauthorized. Token expired or invalid' });
  
  const targetId = req.params.targetId;

  const { json, status } = await circuitBreaker.fire("get", SUBMISSION_SERVICE, `targets/${targetId}/submissions/user`, null, { authorization: req.headers.authorization })
  
  if(!json || status !== 200) return res.status(404).json({ message: 'No scores found for this target' });

  res.json({ message: 'Successfully retrieved scores', images: json.images.map(image => ({ name: image.imageName, score: image.score })) });
});

module.exports = router;
