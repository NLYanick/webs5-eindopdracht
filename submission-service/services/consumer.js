const { consume } = require("../../pubsub");

async function startConsumers() {
    await consume('TODO', async (msg) => {
        console.log(msg)
    });
}

module.exports = startConsumers;