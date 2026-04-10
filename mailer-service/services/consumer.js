const { consume } = require("../../pubsub");
const { sendGreetingEmail, sendScoreEmail } = require("./mailer");

const mongoose = require("mongoose");

const User = mongoose.model("User");
const Target = mongoose.model("Target");

async function startConsumers() {
    await consume('target.events', async (msg) => {
        console.log(msg)
        if (msg.type === 'target.reminder') {
            try {
                const { targetId } = msg.data;

                const target = await Target.findOne({ uid: userUid });
                if (!user) return console.error('target not found for targetId:', targetId);

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
            Target.create({_id: msg.data._id, endDate: endDate})
        }
    });

    await consume('score.events', async (msg) => {
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

    await consume('auth.events', async (msg) => {
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
}

module.exports = startConsumers;
