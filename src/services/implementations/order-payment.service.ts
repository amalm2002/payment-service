import { IOrderPaymentService } from '../interfaces/order-payment.service.interface';
import { CreatePaymentDTO, CreatePaymentResponseDTO, CreateUPIPaymentResponseDTO, VerifyUpiPaymentDTO, VerifyUpiPaymentResponseDTO, } from '../../dto/create-payment.dto';
import { IPaymentRepository } from '../../repositories/interfaces/order-payment.repository.interface';
import RabbitMqOrderClient from '../../rabbitmq/order-service-connection/client';
import RabbitMqRestaurantClient from '../../rabbitmq/restaurant-service-connection/client';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import { createHash } from 'crypto';
import { generateCartHash } from '../../utils/cart-hash.util';
import redisClient from '../../config/redis.config';

export class OrderPaymentService implements IOrderPaymentService {
    private readonly razorpay: Razorpay;

    constructor(private readonly paymentRepository: IPaymentRepository) {
        this.razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID || '',
            key_secret: process.env.RAZORPAY_SECRET_ID || ''
        });
    }

    private generateCartHash(cartItems: any[]): string {
        const cartString = JSON.stringify(
            cartItems.map(item => ({
                id: item.id,
                quantity: item.quantity,
                price: item.price,
            })).sort((a, b) => a.id.localeCompare(b.id))
        );
        return createHash('sha256').update(cartString).digest('hex');
    }

    async handleCashOnDelivery(data: CreatePaymentDTO): Promise<CreatePaymentResponseDTO> {
        try {
            const payment = await this.paymentRepository.createPayment(data);
            const operation = 'Create-COD-Order';
            const result = await RabbitMqOrderClient.produce(data, operation);
            await this.paymentRepository.updatePaymentStatus(
                payment.id,
                result?.success ? 'COMPLETED' : 'FAILED',
                result.orderId
            );

            return {
                payment,
                success: result?.success,
                orderId: result?.orderId.toString()
            };
        } catch (error: any) {
            return { message: (error as Error).message, success: false }
        }
    }

    async createUpiPaymentOrder(data: CreatePaymentDTO): Promise<CreateUPIPaymentResponseDTO> {
        try {
            const { amount, userId, cartItems } = data;
            const cartHash = this.generateCartHash(cartItems);
            const lockKey = `order:lock:${userId}:${cartHash}`;

            const existingLock = await redisClient.get(lockKey);
            if (existingLock) {
                return {
                    error: 'A payment is already in progress for this order. Please complete or wait a moment.'
                };
            }
            const operation = 'Check-Stock'
            const stockCheck = await RabbitMqRestaurantClient.produce(data.cartItems, operation);
            // console.log('stockCheck result :', stockCheck);

            if (!stockCheck?.success) {
                return { error: stockCheck.message || 'Stock check failed.' };
            }
            await redisClient.set(lockKey, 'locked', {
                EX: 120,
            });
            const payload = {
                amount: amount * 100,
                currency: 'INR',
                receipt: `receipt_${new Date().getTime()}`,
            };
            const rawOrder = await this.razorpay.orders.create(payload);

            const payment = await this.paymentRepository.createPayment({
                ...data,
                paymentMethod: 'UPI',
                status: 'PENDING',
            });

            return {
                orderId: rawOrder.id,
                razorpayKey: process.env.RAZORPAY_KEY_ID,
                paymentDbId:payment.id
            };
        } catch (error) {
            console.error('Error in createOrder:', error);
            return { error: `Failed to create order: ${(error as Error).message}` };
        }
    }

    async verifyUpiPayment(data: VerifyUpiPaymentDTO): Promise<VerifyUpiPaymentResponseDTO> {
        try {
            const { razorpayOrderId, razorpayPaymentId, razorpaySignature, orderData,paymentDbId } = data;
            const razorData = razorpayOrderId + '|' + razorpayPaymentId;

            const expectedSignature = crypto
                .createHmac('sha256', process.env.RAZORPAY_SECRET_ID || '')
                .update(razorData.toString())
                .digest('hex');

            if (expectedSignature !== razorpaySignature) {
                return { success: false, error: 'Invalid signature' };
            }

            const cartHash = generateCartHash(orderData.cartItems);
            const lockKey = `order:lock:${orderData.userId}:${cartHash}`;

            const operation_1 = 'Reduce-Stock'
            const stockReduce = await RabbitMqRestaurantClient.produce(orderData, operation_1);
            if (!stockReduce?.success) {
                return { success: false, error: stockReduce.message || 'Stock update failed.' };
            }

            const operation = 'Create-UPI-Order';
            const orderResult = await RabbitMqOrderClient.produce(orderData, operation);
            if (!orderResult || !orderResult.orderId) {
                throw new Error('Order service did not return a valid orderId');
            }

            await this.paymentRepository.updatePaymentStatus(
                data.paymentDbId, 
                'COMPLETED',
                orderResult.orderId
            );

            await redisClient.del(lockKey);

            return { success: true, orderId: orderResult.orderId };
        } catch (error: any) {
            const cartHash = generateCartHash(data?.orderData?.cartItems || []);
            const lockKey = `order:lock:${data?.orderData?.userId}:${cartHash}`;
            await redisClient.del(lockKey);
            console.error('UPI Payment verification failed:', error);
            return {
                success: false,
                error: `Payment verification failed: ${error.message || 'Unknown error'}`
            };
        }
    }

}