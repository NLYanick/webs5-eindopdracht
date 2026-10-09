const express = require('express');
const router = express.Router();
const swaggerUi = require('swagger-ui-express');
const swaggerFile = require('../../swagger-output.json');

router.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerFile));

router.get('/', function(req, res, next) {
  res.json({ message: 'You found the API 🎉' });
});


module.exports = router;
