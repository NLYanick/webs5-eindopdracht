const { consume } = require("../../pubsub");
const { sendGreetingEmail, sendScoreEmail, sendReminderEmails } = require("./mailer");

const mongoose = require("mongoose");

const User = mongoose.model("User");
const Target = mongoose.model("Target");
const Register = mongoose.model("Register");

async function startConsumers() {
    await consume('target.events', "mailer.target", async (msg) => {
        if (msg.type === 'target.reminder') {
            try {
                const { targetId } = msg.data;

                const target = await Target.findOne({ _id: targetId});
                const timeLeft = getTimeLeft(target.endDate)

                const registrations = await Register.find({ targetId: targetId, hasSubmitted: false });
                if (!registrations || registrations.length == 0) return console.error('target not found for targetId:', targetId);

                const uids = registrations.map(r => r.userUid);
                const users = await User.find({ uid: { $in: uids } });
                const emails = users.map(u => u.email);

                await sendReminderEmails(
                    emails,
                    targetId,
                    timeLeft
                );
            } catch (error) {
                console.error('Error sending score mail:', error);
            }
        }
        if(msg.type === 'target.created'){
            await Target.create({_id: msg.data.id, endDate: msg.data.endDate})
        }
        if(msg.type === 'target.deleted'){
            await Target.deleteOne({_id: msg.data._id})
            await Register.deleteMany({targetId: msg.data._id})
        }
    });

    await consume('score.events', "mailer.score", async (msg) => {
        if (msg.type === 'score.created') {
            try {
                const { userUid, score, targetId } = msg.data;

                const user = await User.findOne({ uid: userUid });
                if (!user) return console.error('User not found for uid:', userUid);
                await sendScoreEmail(
                    user.email,
                    user.username,
                    score,
                    targetId,
                );
            } catch (error) {
                console.error('Error sending score mail:', error);
            }
        }
    });

    await consume('auth.events', "mailer.auth", async (msg) => {
        if (msg.type === 'user.registered') {
            try {
                const { uid, email, username } = msg.data;

                await User.create({ uid, username, email });

                await sendGreetingEmail( email, username );
            } catch (error) {
                console.error('Error sending registration mail:', error);
            }
        }
    });

    await consume('register.events', "mailer.register", async (msg) => {
        if (msg.type === 'register.created') {
            try {
                await Register.create( msg.data );
            } catch (error) {
                console.error('Error sending registration mail:', error);
            }
        }
    });

    await consume('submission.events', "mailer.submission", async (msg) => {
        if (msg.type === 'submission.created') {
            try {
                const {targetId, userUid} = msg.data

                await Register.findOneAndUpdate(
                    { targetId: targetId, userUid: userUid },
                    { hasSubmitted: true }
                );
            } catch (error) {
                console.error('Error sending registration mail:', error);
            }
        }
    });
}

function getTimeLeft(endDate) {
    const diff = new Date(endDate) - new Date();

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 24) {
        const days = Math.floor(hours / 24);
        return `${days} day${days > 1 ? 's' : ''} left`;
    }

    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} and ${minutes} minute${minutes > 1 ? 's' : ''} left`;

    return `${minutes} minute${minutes > 1 ? 's' : ''} left`;
}

module.exports = startConsumers;
