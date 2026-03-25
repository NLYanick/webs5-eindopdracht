const { consume } = require("../../pubsub");

async function startConsumers() {
    await consume('update-score', async (msg) => {
        console.log(msg)
    });
}

module.exports = startConsumers;