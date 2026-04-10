const { consume } = require("../../pubsub");
const mongoose = require("mongoose")
require("./database.js");

const Target = mongoose.model("Target");
const Submission = mongoose.model("Submission");
const Register = mongoose.model("Register");
const Votes = mongoose.model("Votes");

async function startConsumers() {
    await consume('target.events', async (msg) => {
        if (msg.type === 'target.created') {
            await Target.create({
            _id: msg.data.id,
            ...msg.data,
            });
        }
        if (msg.type === 'target.deleted') {
            await Target.findByIdAndDelete(msg.data._id);
            await Submission.deleteMany({ targetId: msg.data._id });
        }
        if (msg.type === 'target.closed') {
            await Target.findByIdAndUpdate(msg.data.id, { status: 'CLOSED' });
        }
        if(msg.type === 'target.votes.added') {
            await Votes.updateOne({
                targetId: msg.data.targetId,
                userUid: msg.data.userUid
            }, {
                _id: msg.data._id,
                vote: msg.data.vote
            }, { upsert: true }); // Create a new vote if it doesn't exist
        }
        if(msg.type === 'target.votes.removed') {
            console.log(msg.data)
            await Votes.deleteOne({_id: msg.data._id});
        }
    });
    await consume('submission.events', async (msg) => {
        if (msg.type === 'submission.created') {
            try {
                const submission = msg.data;
                await Submission.create({
                    photoUrl: submission.imageName,
                    ...submission,
                });
            } catch (error) {
                console.error("Error saving submission creation:", error);
            }
        }

        if (msg.type === 'submission.deleted') {
            try {
                const submission = msg.data;
                await Submission.deleteOne({ _id: submission._id });
                console.log('Submission deleted from reader DB:', submission._id);
            } catch (error) {
                console.error("Error saving submission deletion:", error);
            }
        }
    });

    await consume('score.events', async (msg) => {
        try {
            if (msg.type === 'score.created') {
                // Update the submission with its score when it comes in
                await Submission.findOneAndUpdate(
                    { photoUrl: msg.data.photoUrl },
                    { score: msg.data.score }
                );
                console.log('Score updated on submission in reader DB:', msg.data.imageName);
            }
            if (msg.type === 'score.winner') {
                // Update the submission with its score when it comes in
                await Target.findOneAndUpdate(
                    { _id: msg.data.targetId },
                    { winner: msg.data.userUid }
                );
                console.log('Score updated on submission in reader DB:', msg.data.imageName);
            }
        } catch (error) {
            console.error(`Error handling score event (${msg.type}):`, error);
        }
    });

    await consume('register.events', async (msg) => {
        if (msg.type === 'register.created') {
            try {
                await Register.create({ _id: msg.data._id, targetId: msg.data.targetId, userUid: msg.data.userUid });
            } catch (error) {
                console.error("Error saving register creation:", error);
            }
        }
        if (msg.type === 'register.deleted') {
            try {
                await Register.deleteOne({ _id: msg.data._id });
            } catch (error) {
                console.error("Error saving register deletion:", error);
            }
        }
    });
}

module.exports = startConsumers;