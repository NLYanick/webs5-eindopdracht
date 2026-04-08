const mongoose = require("mongoose");
const { consume } = require("../../pubsub");

const Target = mongoose.model("Target");
const Submission = mongoose.model("Submission");
const Register = mongoose.model("Register");

async function startConsumers() {
    await consume('target.events', async (msg) => {
        if (msg.type === 'target.created') {
            try {
                await Target.create({ _id: msg.data.id, organizerId: msg.data.organizerId });
            } catch (error) {
                console.error("Error creating target ID:", error);
            }
        }
        if (msg.type === 'target.deleted') {
            try {
                await Target.deleteOne({ _id: msg.data._id });
                await Submission.deleteMany({ targetId: msg.data.id });
            } catch (error) {
                console.error("Error creating target ID:", error);
            }
        }
        if (msg.type === "target.closed") {
            try {
                const targetId = msg.data.id;

                await Target.findOneAndUpdate(
                    { _id: targetId, status: "OPEN" },
                    { status: "CLOSED" }
                );
            } catch (error) {
                console.error("Error handling target.closed:", error);
            }
        }
    });
    await consume('register.events', async (msg) => {
        if (msg.type === 'register.created') {
            try {
                await Register.create({ targetId: msg.data.targetId, userUid: msg.data.userUid });
            } catch (error) {
                console.error("Error creating register:", error);
            }
        }
        if (msg.type === 'register.deleted') {
            try {
                await Register.deleteOne({ _id: msg.data.id });
            } catch (error) {
                console.error("Error deleting register:", error);
            }
        }
    });
}

module.exports = startConsumers;