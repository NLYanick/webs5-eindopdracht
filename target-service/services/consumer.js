const { consume } = require("../../pubsub");
const mongoose = require('mongoose');
const Target = mongoose.model('Target');
const Register = mongoose.model('Register');

async function startConsumers() {
    await consume('target.events', "target.target", async (msg) => {
        if (msg.type === 'target.closed') {
            await Target.findByIdAndUpdate(msg.data.id, { status: 'CLOSED' });
        }
    });
    await consume('register.events', "target.register", async (msg) => {
        if (msg.type === 'register.created') {
            try {
                await Register.create({ _id: msg.data._id, targetId: msg.data.targetId, userUid: msg.data.userUid });
            } catch (error) {
                console.error("Error creating register:", error);
            }
        }
        if (msg.type === 'register.deleted') {
            try {
                await Register.deleteOne({ _id: msg.data._id });
            } catch (error) {
                console.error("Error deleting register:", error);
            }
        }
    });
}

module.exports = startConsumers;