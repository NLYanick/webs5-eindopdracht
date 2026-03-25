const mongoose = require("mongoose");
const { consume } = require("../../pubsub");

const TargetSubmission = mongoose.model("TargetSubmission");

async function startConsumers() {
    await consume('update-score', async (msg) => {
        console.log(msg)
        await TargetSubmission.updateOne({ imageName: msg.imageName }, { score: msg.score });
    });
}

module.exports = startConsumers;