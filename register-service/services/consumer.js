const { consume } = require("../../pubsub");
const mongoose = require("mongoose")

const Registers = mongoose.model("Registers");

async function startConsumers() {
    await consume('target.events', async (msg) => {
        if (msg.type === 'target.deleted') {
            const registers = await Registers.find({ targetId: msg.data.id });
            await Registers.deleteMany({ targetId: msg.data.id });

            for (const register of registers) {
                await publish('register.events', { type: 'register.deleted', data: register });
            }
        }
    });
}

module.exports = startConsumers;