const mongoose = require("mongoose");
const { consume } = require("../../pubsub");

const TargetSubmission = mongoose.model("TargetSubmission");
const TargetId = mongoose.model("TargetId");

async function startConsumers() {
    await consume('update-score', async (msg) => {
        console.log(msg)
        await TargetSubmission.updateOne({ imageName: msg.imageName }, { score: msg.score });
    });
    await consume('target-created', async (msg) => {
        console.log(msg)
        await TargetId.create({ targetId: msg.targetId });
    });
}

module.exports = startConsumers;