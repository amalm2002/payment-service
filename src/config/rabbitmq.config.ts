
import 'dotenv/config'

export default {
    rebbitMQ: {
        url: String(process.env.RABBITMQ_URL)
    },
    queue: {
        orderServiceQueue: 'order_service_queue',
        restaurantServiceQueue: 'restaurant_queue'
    }
}
