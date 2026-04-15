const Timer = require("./database");
const { publish } = require("../../pubsub");

const REMINDER_INTERVAL = 30 * 60 * 1000; // 30 minutes
const POLLING_INTERVAL = 60 * 1000; // 1 minute

async function triggerClose(id) {
    const timer = await Timer.findOneAndDelete({ _id: id });
    if (!timer) return;

    await publish("target.events", {
        type: "target.closed",
        data: { id: id }
    });
}

async function restoreTimers() {
    setInterval(async () => {
        await removeExpiredTimers();

        await checkReminders();
    }, POLLING_INTERVAL);
}

async function removeExpiredTimers() {
    const now = new Date();

    const expiredTimers = await Timer.find({ closeAt: { $lte: now } });
    for (const timer of expiredTimers) {
        await triggerClose(timer._id);
    }
}

async function checkReminders() {
    const now = new Date();
    const reminderThreshold = new Date(now.getTime() - REMINDER_INTERVAL);

    const timersDueForReminder = await Timer.find({
        closeAt: { $gt: now },
        lastReminderAt: { $lte: reminderThreshold }
    });

    for (const timer of timersDueForReminder) {
        await triggerReminder(timer._id);
    }
}

async function triggerReminder(id) {
    const now = Date.now();

    const timer = await Timer.findOneAndUpdate(
        {
            _id: id,
            lastReminderAt: { $lte: new Date(now - REMINDER_INTERVAL) }
        },
        { lastReminderAt: new Date(now) },
        { returnDocument: 'after' }
    );

    if (!timer || now >= timer.closeAt.getTime()) return;

    await publish("target.events", {
        type: "target.reminder",
        data: { targetId: id }
    });
}


module.exports = {
    restoreTimers
};
