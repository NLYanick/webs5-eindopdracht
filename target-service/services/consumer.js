const { consume } = require("../../pubsub");
const Target = require("./database.js");

async function startConsumers() {
    await consume('target.events', async (msg) => {
        if (msg.type === 'target.ended') {
            await Target.findByIdAndUpdate(msg.data.id, { status: 'closed' });
            console.log(`Target ${msg.data.id} closed`);
        }
    });
}

module.exports = startConsumers;