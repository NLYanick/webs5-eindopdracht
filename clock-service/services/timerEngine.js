const Timer = require("./database");
const { publish } = require("../../pubsub");

const activeTimers = new Map();
const activeReminders = new Map();

const REMINDER_INTERVAL = 30 * 60 * 1000;

function scheduleTimer(timerDoc) {
    const delay = timerDoc.closeAt - Date.now();
    if (delay <= 0) {
        triggerClose(timerDoc._id);
        return;
    }

    if (activeTimers.has(timerDoc._id)) {
        clearTimeout(activeTimers.get(timerDoc._id));
    }

    const timeout = setTimeout(() => {
        triggerClose(timerDoc._id);
    }, delay);

    activeTimers.set(timerDoc._id, timeout);
    setReminder(timerDoc);
}

async function triggerClose(id) {
    clearTimers(id);

    const timer = await Timer.findOneAndDelete({ _id: id });
    if (!timer) return;

    await publish("target.events", {
        type: "target.closed",
        data: {id: id }
    });
}

async function restoreTimers() {
    const timers = await Timer.find();

    for (const timer of timers) {
        scheduleTimer(timer);
    }
}

function clearTimers(id){
    clearTimeout(activeTimers.get(id));
    clearTimeout(activeReminders.get(id));
    activeTimers.delete(id);
    activeReminders.delete(id);
}

async function cancelTimer(id) { 
    clearTimers(id);
    await Timer.findByIdAndDelete({ _id: id });
}

function setReminder(timerDoc) {
    const now = Date.now();

    const referenceTime = timerDoc.lastReminderAt.getTime();
    const nextReminderAtMs = referenceTime + REMINDER_INTERVAL;

    if (nextReminderAtMs >= timerDoc.closeAt.getTime()) {
        return;
    }

    const delay = nextReminderAtMs - now;

    if (delay <= 0) {
        triggerReminder(timerDoc._id);
        return;
    }

    clearTimeout(activeReminders.get(timerDoc._id));

    const timeout = setTimeout(() => {
        triggerReminder(timerDoc._id);
    }, delay);

    activeReminders.set(timerDoc._id, timeout);
}

async function triggerReminder(id) {
    clearTimeout(activeReminders.get(id));
    activeReminders.delete(id);

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
        data: { id }
    });
    setReminder(timer);
}


module.exports = {
    scheduleTimer,
    triggerClose,
    restoreTimers,
    cancelTimer
};
