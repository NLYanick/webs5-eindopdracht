const { consume } = require("../../pubsub");

async function startConsumers() {
    await consume('calculate-score', async (msg) => {
        console.log(msg)
    });
}

module.exports = startConsumers;