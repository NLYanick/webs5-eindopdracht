require('dotenv').config();
require('./services/database.js');

const startConsumers = require('./services/consumer.js');

async function main() {
    try {
        await startConsumers();
        console.log('📧 Mailer service started');
    } catch (err) {
        console.error('❌ Failed to start mailer service', err);
        process.exit(1);
    }
}

main();