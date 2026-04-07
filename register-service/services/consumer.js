const { consume } = require("../../pubsub");

async function startConsumers() {
    await consume('Test', async (msg) => {
        console.log(msg)
    });
}

module.exports = startConsumers;