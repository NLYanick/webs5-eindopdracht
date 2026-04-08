const { consume } = require("../../pubsub");
const mongoose = require("mongoose")
require("./database.js");

const Target = mongoose.model("Target");

async function startConsumers() {
    await consume('target.events', async (msg) => {
        if (msg.type === 'target.created') {
            await Target.create({
            _id: msg.data.id,
            ...msg.data,
            });
        }
        if (msg.type === 'target.deleted') {
            await Target.findByIdAndDelete(msg.data.id);
        }
        if (msg.type === 'target.closed') {
            await Target.findByIdAndUpdate(msg.data.id, { status: 'CLOSED' });
        }
    });
}

module.exports = startConsumers;