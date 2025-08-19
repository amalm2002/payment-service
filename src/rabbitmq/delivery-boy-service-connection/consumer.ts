import { Channel, ConsumeMessage } from "amqplib";
import EventEmitter from "events";

export default class Consumer {
    constructor(
        private readonly _channel: Channel,
        private readonly _replyQueueName: string,
        private readonly _eventEmitter: EventEmitter
    ) {}

    async consumeMessage() {
        console.log('Starting to consume messages...');

        this._channel.consume(
            this._replyQueueName,
            (message: ConsumeMessage | null) => {
                if (message) {
                    const correlationId = message.properties.correlationId;
                    const operation = message.properties.headers?.operation;

                    console.log(`Received message for operation: ${operation}`);

                    if (correlationId) {
                        this._eventEmitter.emit(correlationId.toString(), message);
                    } else {
                        console.warn("Message missing correlationId:", message);
                    }
                }
            },
            { noAck: true }
        );
    }
}
