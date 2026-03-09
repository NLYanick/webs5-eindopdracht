require('dotenv').config();

const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());


const router = express.Router();

router.use('/', indexRouter);
router.use('/users', usersRouter);

app.use('/api/v1', router);


app.use(function(req, res, next) {
  res.status(404).json({ message: "Resoure not found" });
});

app.use(function(err, req, res, next) {
  console.error(err);
  res.status(500).json({ message: "Internal Server Error" });
});

const port = process.env.GATEWAY_PORT || 3000;
app.listen(port, () => console.log(`Listening on port ${port}: http://localhost:${port}/api/v1`));
