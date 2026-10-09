const { consume } = require("../../pubsub");

async function startConsumers() {
    await consume('Test', async (msg) => {
        console.log(msg)
    });
    await consume('Test2', async (msg) => {
        console.log(msg)
    });
}

module.exports = startConsumers;