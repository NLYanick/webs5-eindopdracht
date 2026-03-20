require('dotenv').config();

const express = require('express');
const cors = require('cors');
require('./services/database.js');

const app = express();
const port = process.env.AUTH_PORT || 3001;
const authRoute = require('./routes/index.js');

app.use(cors())
app.use(express.json());


app.use('/auth', authRoute)


app.listen(port, () => console.log(`Listening on port ${port}: http://localhost:${port}`));