import { IOrderPaymentService } from '../interfaces/order-payment.service.interface';
import {
    CreatePaymentDTO,
    CreatePaymentResponseDTO,
    CreateUPIPaymentResponseDTO,
    HandleFailedPaymentDTO,
    HandleFailedPaymentResponseDTO,
    VerifyUpiPaymentDTO,
    VerifyUpiPaymentResponseDTO,
} from '../../dto/order/create-payment.dto';
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

    async handleCashOnDelivery(cashPaymentRequest: CreatePaymentDTO): Promise<CreatePaymentResponseDTO> {
        try {
            const payment = await this.paymentRepository.createPayment(cashPaymentRequest);
            const operation = 'Create-COD-Order';
            const result = await RabbitMqOrderClient.produce(cashPaymentRequest, operation);
            await this.paymentRepository.updatePaymentStatus(
                payment.id,
                result?.success ? 'COMPLETED' : 'FAILED',
                result.orderId
            );

            return {
                payment,
                success: result?.success,
                orderId: result?.orderId.toString(),
                orderNumber: result?.orderNumber
            };
        } catch (error: any) {
            return { message: (error as Error).message, success: false }
        }
    }

    async createUpiPaymentOrder(upiPaymentRequest: CreatePaymentDTO): Promise<CreateUPIPaymentResponseDTO> {
        try {
            const { amount, userId, cartItems } = upiPaymentRequest;
            const cartHash = this.generateCartHash(cartItems);
            const lockKey = `order:lock:${userId}:${cartHash}`;

            const existingLock = await redisClient.get(lockKey);
            if (existingLock) {
                return {
                    error: 'A payment is already in progress for this order. Please complete or wait a moment.'
                };
            }
            const operation = 'Check-Stock'
            const stockCheck = await RabbitMqRestaurantClient.produce(upiPaymentRequest.cartItems, operation);

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
                ...upiPaymentRequest,
                paymentMethod: 'UPI',
                status: 'PENDING',
            });

            return {
                orderId: rawOrder.id,
                razorpayKey: process.env.RAZORPAY_KEY_ID,
                paymentDbId: payment.id
            };
        } catch (error) {
            console.error('Error in createOrder:', error);
            return { error: `Failed to create order: ${(error as Error).message}` };
        }
    }

    async verifyUpiPayment(upiPaymentVerificationRequest: VerifyUpiPaymentDTO): Promise<VerifyUpiPaymentResponseDTO> {
        try {
            const { razorpayOrderId, razorpayPaymentId, razorpaySignature, orderData, paymentDbId } = upiPaymentVerificationRequest;
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
                upiPaymentVerificationRequest.paymentDbId,
                'COMPLETED',
                orderResult.orderId
            );

            await redisClient.del(lockKey);

            return { success: true, orderId: orderResult.orderId, orderNumber: orderResult.orderNumber };
        } catch (error: any) {
            const cartHash = generateCartHash(upiPaymentVerificationRequest?.orderData?.cartItems || []);
            const lockKey = `order:lock:${upiPaymentVerificationRequest?.orderData?.userId}:${cartHash}`;
            await redisClient.del(lockKey);
            console.error('UPI Payment verification failed:', error);
            return {
                success: false,
                error: `Payment verification failed: ${error.message || 'Unknown error'}`
            };
        }
    }

    async handleFailedPayment(failedPaymentRequest: HandleFailedPaymentDTO): Promise<HandleFailedPaymentResponseDTO> {
        try {
            const { paymentDbId, razorpayOrderId, razorpayPaymentId, errorDescription, errorCode } = failedPaymentRequest;
            await this.paymentRepository.updatePaymentStatus(paymentDbId, 'FAILED');
            const cartHash = await this.paymentRepository.getCartHash(paymentDbId);
            const lockKey = `order:lock:${failedPaymentRequest.userId}:${cartHash}`;
            await redisClient.del(lockKey);
            return {
                success: true,
                message: 'Payment failure recorded successfully',
            };
        } catch (error: any) {
            console.error('Error in handleFailedPayment:', error);
            return {
                success: false,
                message: `Failed to process payment failure: ${error.message || 'Unknown error'}`,
            };
        }
    }

}