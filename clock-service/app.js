require('dotenv').config();
require('./services/database.js');

const startConsumers = require('./services/consumer.js');
const { restoreTimers } = require("./services/timerEngine");

async function main() {
    try {
        await restoreTimers(); 
        await startConsumers();
        console.log("⏱ Timer service started");
    } catch (err) {
        console.error("❌ Failed to start timer service", err);
        process.exit(1);
    }
}

main();

