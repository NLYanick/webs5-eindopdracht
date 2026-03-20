const rabbitConnection = require('../../rabbitmq-connection.js');
let channel;

startup();

async function startup() {
    try {
        const connection = await rabbitConnection;
        if (channel === undefined) {
            channel = await connection.createChannel();
        }
        await channel.assertExchange("Post", "fanout", { durable: false });
    } catch (error) {
        console.log('err in publisher : ' + error);
    }
}

const publish = async function publish(msg) {
    try {
        await channel.publish("Post", "", Buffer.from(JSON.stringify(msg)));

        console.log("Send message: ", msg);
    } catch (error) {
        console.log('err in publisher : ' + error);
    }
}

module.exports = publish;