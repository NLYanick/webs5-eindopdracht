const { consume } = require("../../pubsub");

async function startConsumers() {
    await consume('Test-Queue', async (msg) => {
        console.log(msg)
    });
    await consume('Test-Queue-2', async (msg) => {
        console.log(msg)
    });
}

module.exports = startConsumers;