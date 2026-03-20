require('dotenv').config();

const amqp = require('amqplib');
const connection = await amqp.connect(process.env.RABBITMQ_URL);

module.exports = connection;
