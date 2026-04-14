const { consume } = require("../../pubsub");
const mongoose = require("mongoose")

const Register = mongoose.model('Register');

async function startConsumers() {
    await consume('target.events', "register.target", async (msg) => {
        if (msg.type === 'target.deleted') {
            const registers = await Register.find({ targetId: msg.data.id });
            await Register.deleteMany({ targetId: msg.data.id });

            for (const register of registers) {
                await publish('register.events', { type: 'register.deleted', data: register });
            }
        }
    });
}

module.exports = startConsumers;