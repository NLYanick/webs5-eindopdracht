require('dotenv').config();
require('./services/database.js');

const express = require('express');
const cookieParser = require('cookie-parser');

const indexRouter = require('./routes/index.js');
const startConsumers = require('./services/consumer.js');


const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use('/reader', indexRouter);


async function main() {
  try {
    await startConsumers();
  } catch (error) {
    console.log("[=] Internal server error");
  }
}

main();

app.use(function(req, res, next) {
  res.status(404).json({ message: "Resource not found" });
});

// Error handler
app.use(function(err, req, res, next) {
  console.error(err);
  res.status(500).json({ message: "Internal Server Error" });
});

const port = process.env.READER_PORT || 3006;
app.listen(port, () => console.log(`Listening on port ${port}: http://localhost:${port}/targets`));
