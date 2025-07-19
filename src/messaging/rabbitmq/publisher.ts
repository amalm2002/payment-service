import { Channel, connect } from 'amqplib';
import rabbitMQConfig from '../../config/rabbitmq.config';

let channel: Channel;

async function getChannel(): Promise<Channel> {
    if (channel) return channel;
    const conn = await connect(rabbitMQConfig.rebbitMQ.url);
    channel = await conn.createChannel();
    return channel;
}

const Publisher = {
    async publishToQueue(queue: string, data: any, correlationId?: string, replyTo?: string, operation?: string) {
        const ch = await getChannel();
        ch.sendToQueue(queue, Buffer.from(JSON.stringify(data)), {
            contentType: 'application/json',
            correlationId,
            replyTo,
            headers: {
                function: operation,   
            },
        });
    },
};

export default Publisher;
