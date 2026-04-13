require('dotenv').config();

const express = require('express');
const cookieParser = require('cookie-parser');
const path = require('path');

const indexRouter = require('./routes/index');
const authRouter = require('./routes/auth');
const submissionsRouter = require('./routes/submissions');
const targetsRouter = require('./routes/targets');
const scoresRouter = require('./routes/scores');
const registersRouter = require('./routes/registers');
const { checkOpaqueAndReplaceWithJWT } = require('../utils');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());


const router = express.Router({ mergeParams: true });

router.use('/', indexRouter);
router.use('/auth', authRouter);
router.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));
router.use(checkOpaqueAndReplaceWithJWT);
router.use('/targets', targetsRouter);
router.use('/targets/:targetId/registers', registersRouter);
router.use('/targets/:targetId/submissions', submissionsRouter);
router.use('/scores', scoresRouter);

app.use('/api/v1', router);

// Other url's go to 404 page
app.use(function(req, res, next) {
  res.status(404).json({ message: "Resource not found", url: req.originalUrl });
});

// Error handler
app.use(function(err, req, res, next) {
  console.error(err);
  res.status(500).json({ message: "Internal Server Error" });
});

const port = process.env.GATEWAY_PORT || 3000;
app.listen(port, () => console.log(`Listening on port ${port}: http://localhost:${port}/api/v1`));
