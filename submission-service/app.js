require('dotenv').config();
require('./services/database.js'); // Start database

const express = require('express');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');

const indexRouter = require('./routes/index');
const startConsumers = require('./services/consumer.js');

const Target = mongoose.model("Target");


const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());


app.use('/targets/:targetId/submissions', checkIfTargetExists, indexRouter);

async function checkIfTargetExists(req, res, next) {
  const targetId = req.params.targetId;
  
  const targetExists = await Target.exists({ targetId: targetId });
  if (!targetExists) return res.status(404).json({ message: 'Target not found' });
  
  next();
}

async function main() {
  try {
    await startConsumers();
  } catch (error) {
    console.log("[=] Internal server error");
  }
}

main();


app.use(function (req, res, next) {
  res.status(404).json({ message: "Resource not found" });
});

// Error handler
app.use(function (err, req, res, next) {
  console.error(err);
  res.status(500).json({ message: "Internal Server Error" });
});

const port = process.env.SUBMISSION_PORT || 3003;
app.listen(port, () => console.log(`Listening on port ${port}: http://localhost:${port}`));
