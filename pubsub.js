const { getConnection } = require('./rabbitmq-connection.js');
let channel;

async function getChannel() {
    try {
        if (!channel) {
            const connection = await getConnection();
            channel = await connection.createChannel();
        }

        return channel;
    } catch (error) {
        console.log('err in getChannel : ' + error);
    }
}

const consume = async (queue, handler) => {
    try {
        const channel = await getChannel();
        
        await channel.assertExchange(queue, "fanout", { durable: false });

        const q = await channel.assertQueue("", { exclusive: false});
        await channel.bindQueue(q.queue, queue, "");

        await channel.consume(q.queue, async (message) => {
            const msg = JSON.parse(message.content.toString());

            handler(msg);
            
            channel.ack(message);
        });
    } catch (error) {
        console.log(`error is: ${error}`);
    }
}

const publish = async function publish(queue, msg) {
    try {
        const channel = await getChannel();
        
        await channel.assertExchange(queue, "fanout", { durable: false });
        await channel.publish(queue, "", Buffer.from(JSON.stringify(msg)));

        console.log("Send message: ", msg);
    } catch (error) {
        console.log('err in publisher : ' + error);
    }
}

module.exports = { 
    consume,
    publish
};