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
    await consume('target.events', async (msg) => {
        try {
            switch (msg.type) {
                case 'target.created':
                    await TargetId.create({ targetId: msg.data.id, photoUrl: msg.data.photoUrl });
                    break;
                case 'target.deleted':
                    await TargetId.deleteOne({ targetId: msg.data.id });
                    await TargetSubmission.deleteMany({ targetId: msg.data.id });
                    break;
                default:
                    console.warn(`Unhandled event type: ${msg.type}`);
            }
        } catch (error) {
            console.error("Error handling target event:", error);
        }
    });
}

module.exports = startConsumers;