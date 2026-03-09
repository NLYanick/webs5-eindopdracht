require('dotenv').config();
require('./database'); // Start database

const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');

const indexRouter = require('./routes/index');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());


const router = express.Router();

router.use('/', indexRouter);

app.use('/targets', router);


app.use(function(req, res, next) {
  res.status(404).json({ message: "Resoure not found" });
});

app.use(function(err, req, res, next) {
  console.error(err);
  res.status(500).json({ message: "Internal Server Error" });
});

const port = process.env.TARGET_SERVICE_PORT || 3000;
app.listen(port, () => console.log(`Listening on port ${port}: http://localhost:${port}/targets`));
