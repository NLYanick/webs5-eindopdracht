const { consume } = require("../../pubsub");
const Timer = require("./database");


async function startConsumers() {
    await consume('target.events', async (msg) => {
        if (msg.type === 'target.created') {
            const { id, endDate } = msg.data || {};

            if (!id || !endDate) {
                console.warn("Invalid target.created message", msg);
                return;
            }

            await Timer.findOneAndUpdate(
                { _id: id },
                { closeAt: new Date(endDate) },
                { upsert: true, new: true }
            );
        }
        if (msg.type === 'target.deleted') {
            const id = msg.data._id;
            if (!id) return;

            await Timer.findByIdAndDelete({ _id: id });
        }
    });
}

module.exports = startConsumers;