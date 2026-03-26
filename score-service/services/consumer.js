const { consume, publish } = require("../../pubsub");
const circuitBreaker = require("./circuit-breaker");

async function startConsumers() {
    await consume('calculate-score', async (msg) => {
        console.log(msg)
        
        // TODO calculate score
        circuitBreaker

        // TODO send correct score
        publish('update-score', { imageName: msg.submission.imageName, score: -100 }); 
    });
}

module.exports = startConsumers;