const rabbitConnection = require('../../rabbitmq-connection.js');
let channel;
let connection;

async function getChannel() {
    try {
        if (channel === undefined) {
            connection = await rabbitConnection;
            channel = await connection.createChannel();
            await channel.assertExchange("Comment", "fanout", { durable: false });
        }
        return channel;
    } catch (error) {
        console.log('err in publisher : ' + error);
    }
}

const consume = async () => {
    try {
        const channel = await getChannel();
        
        const q = await channel.assertQueue("", { exclusive: false});
        await channel.bindQueue(q.queue, "Comment", "");

        console.log(` [*] Waiting for messages in ${q.queue}. To exit press CTRL+C`);

        await channel.consume(q.queue, async (message) => {
            const msg = JSON.parse(message.content.toString());

            switch (msg.event) {
                case '':
                    break;
            }
            
            channel.ack(message);
        });

    } catch (error) {
        console.log(`error is: ${error}`);
    }
}

module.exports = consume();