require('dotenv').config();

const amqp = require('amqplib');
let connection;

async function getConnection() {
    if (!connection) {
        connection = await amqp.connect(process.env.RABBITMQ_URL);
    }

    return connection;
}

module.exports = { getConnection };
