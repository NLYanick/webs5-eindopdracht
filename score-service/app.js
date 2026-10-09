require('dotenv').config();
const startConsumers = require('./services/consumer.js');

async function main() {
  try {
    await startConsumers();
  } catch (error) {
    console.log("[=] Internal server error");
  }
}

main();
