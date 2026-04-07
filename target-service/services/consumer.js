const { consume } = require("../../pubsub");
const Target = require("./database.js");

async function startConsumers() {
    await consume('target.events', async (msg) => {
        if (msg.type === 'target.closed') {
            await Target.findByIdAndUpdate(msg.data.id, { status: 'CLOSED' });
        }
    });
}

module.exports = startConsumers;