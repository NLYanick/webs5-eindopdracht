const { consume } = require("../../pubsub");
const Timer = require("./database");
const {scheduleTimer,cancelTimer} = require("./timerEngine");


async function startConsumers() {
    await consume('target.events', async (msg) => {
        if (msg.type === 'target.created') {
            const { id, endDate } = msg.data || {};

            if (!id || !endDate) {
                console.warn("Invalid target.created message", msg);
                return;
            }

            const timer = await Timer.findOneAndUpdate(
                { _id: id },
                { closeAt: new Date(endDate) },
                { upsert: true, new: true }
            );

            scheduleTimer(timer);
        }
        if (msg.type === 'target.deleted') {
            const id = msg.id;
            if (!id) return;
            await cancelTimer(id);

        }
    });
}

module.exports = startConsumers;