import { Channel } from 'amqplib';
import { EventEmitter } from 'events';
import rabbitmqConfig from '../config/rabbitmq.config';
import { randomUUID } from 'crypto';

export default class Producer {
    constructor(
        private channel: Channel,
        private replyQueueName: string,
        private eventEmitter: EventEmitter
    ) { }

    async produceMessage(data: any, operation: string): Promise<any> {
        const correlationId = `${Date.now()}-${Math.random()}`;
        const queueName = rabbitmqConfig.queue.orderServiceQueue;
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

        // this.channel.sendToQueue(
        //     rabbitmqConfig.queue.orderServiceQueue,
        //     Buffer.from(JSON.stringify(data)),
        //     {
        //         replyTo: this.replyQueueName,
        //         correlationId: uuid,
        //         expiration: 10000,
        //         headers: {
        //             function: operation
        //         }
        //     }
        // );

        // console.log('Message sent to queue');

        // return new Promise((res, rej) => {
        //     this.eventEmitter.once(uuid, async (reply) => {
        //         try {
        //             // console.log('Reply received:', reply);
        //             const replyDataString = Buffer.from(reply.content).toString('utf-8');
        //             const replyObject = JSON.parse(replyDataString);
        //             res(replyObject);
        //         } catch (error) {
        //             console.error("Error processing reply message:", error);
        //             rej(error);
        //         }
        //     });
        // });
    }
}