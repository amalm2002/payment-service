import { Channel, connect, Connection } from "amqplib";
import rabbitmqConfig from "../../config/rabbitmq.config";
import Producer from "./producer";
import { EventEmitter } from 'events';
import Consumer from "./consumer";

class RabbitMqClient {
    private constructor() { }

    private static _instance: RabbitMqClient | null = null;
    private _isInitialized = false;
    private _producer: Producer | undefined;
    private _consumer: Consumer | undefined;
    private _connection: Connection | undefined;
    private _produceChannel: Channel | undefined;
    private _consumerChannel: Channel | undefined;
    private _eventEmitter: EventEmitter | undefined;

    public static getInstance(): RabbitMqClient {
        if (!this._instance) {
            this._instance = new RabbitMqClient();
        }
        return this._instance;
    }

    async initialize() {
        if (this._isInitialized) return;

        try {
            this._connection = await connect(rabbitmqConfig.rebbitMQ.url);

            const [produceChannel, consumerChannel] = await Promise.all([
                this._connection.createChannel(),
                this._connection.createChannel()
            ]);

            this._produceChannel = produceChannel;
            this._consumerChannel = consumerChannel;

            const { queue: replyQueueName } = await this._consumerChannel.assertQueue("", { exclusive: true });
            this._eventEmitter = new EventEmitter();

            this._producer = new Producer(this._produceChannel, replyQueueName, this._eventEmitter);
            this._consumer = new Consumer(this._consumerChannel, replyQueueName, this._eventEmitter);
            this._consumer.consumeMessage();

            this._isInitialized = true;
        } catch (error) {
            console.error("RabbitMQ connection error:", error);
        }
    }

    async produce(data: any, operation: string) {
        if (!this._isInitialized) {
            await this.initialize();
        }
        return await this._producer?.produceMessage(data, operation);
    }


}

export default RabbitMqClient.getInstance();
