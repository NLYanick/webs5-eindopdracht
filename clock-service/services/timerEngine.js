const Timer = require("./database");
const { publishEvent } = require("../../pubsub");

const activeTimers = new Map();

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
}

async function triggerClose(id) {
    if (activeTimers.has(id)) {
        clearTimeout(activeTimers.get(id));
        activeTimers.delete(id);
    }

    const timer = await Timer.findOneAndDelete({ _id: id });
    if (!timer) return;

    await publishEvent("target.events", {
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

async function cancelTimer(id) {
    if (activeTimers.has(id)) {
        clearTimeout(activeTimers.get(id));
        activeTimers.delete(id);
    }

    await Timer.findByIdAndDelete({ _id: id });
}


module.exports = {
    scheduleTimer,
    triggerClose,
    restoreTimers,
    cancelTimer
};
