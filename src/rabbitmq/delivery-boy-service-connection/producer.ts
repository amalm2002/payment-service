import { Channel } from 'amqplib';
import { EventEmitter } from 'events';
import rabbitmqConfig from '../../config/rabbitmq.config';
import { randomUUID } from 'crypto';

export default class Producer {
    constructor(
        private channel: Channel,
        private replyQueueName: string,
        private eventEmitter: EventEmitter
    ) { }

    async produceMessage(data: any, operation: string): Promise<any> {
        const correlationId = `${Date.now()}-${Math.random()}`;
        const queueName = rabbitmqConfig.queue.deliveryBoyQueue;
        const uuid = randomUUID();

        return new Promise((resolve, reject) => {
            this.eventEmitter.once(correlationId, (message) => {
                const content = JSON.parse(message.content.toString());
                resolve(content);
            });

            this.channel.sendToQueue(queueName, Buffer.from(JSON.stringify(data)), {
                correlationId,
                replyTo: this.replyQueueName,
                headers: {
                    function: operation
                },
            });
        });

    }

}