const mongoose = require("mongoose");
const { consume } = require("../../pubsub");

const TargetSubmission = mongoose.model("TargetSubmission");
const TargetId = mongoose.model("TargetId");

async function startConsumers() {
    await consume('update-score', async (msg) => {
        console.log(msg)
        try {
            await TargetSubmission.updateOne({ imageName: msg.imageName }, { score: msg.score });
        } catch (error) {
            console.error("Error updating target submission:", error);
        }
    });
    await consume('target-created', async (msg) => {
        console.log(msg)
        try {
            await TargetId.create({ targetId: msg.targetId });
        } catch (error) {
            console.error("Error creating target ID:", error);
        }
    });
}

module.exports = startConsumers;