const mongoose = require("mongoose");
const { consume } = require("../../pubsub");

const Target = mongoose.model("Target");

async function startConsumers() {
    await consume('target.events', async (msg) => {
        if (msg.type === 'target.created') {
            try {
                await Target.create({ _id: msg.data.id });
            } catch (error) {
                console.error("Error creating target ID:", error);
            }
        }
        if (msg.type === 'target.deleted') {
            try {
                await Target.deleteOne({ _id: msg.data.id });
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
}

module.exports = startConsumers;