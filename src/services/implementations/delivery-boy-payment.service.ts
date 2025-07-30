import Razorpay from 'razorpay';
import { IDeliveryBoyPaymentService } from '../interfaces/delivery-boy-payment.service.interfaces';
import { IDeliveryBoyPaymentRepository } from '../../repositories/interfaces/delivery-boy-payment.repository.interface';
import crypto from 'crypto';

export class DeliveryBoyPaymentService implements IDeliveryBoyPaymentService {
    private razorpay: Razorpay;

    constructor(private repository: IDeliveryBoyPaymentRepository) {
        this.razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID || '',
            key_secret: process.env.RAZORPAY_SECRET_ID || '',
        });
    }

    async createDeliveryBoyPayment(data: { deliveryBoyId: string; amount: number }) {
        const { deliveryBoyId, amount } = data;
        const razorOrder = await this.razorpay.orders.create({
            amount,
            currency: 'INR',
            receipt: `receipt_${new Date().getTime()}`,
        });

        await this.repository.createPayment({
            deliveryBoyId,
            amount: amount / 100,
            razorpayOrderId: razorOrder.id,
        });

        return {
            razorpayKey: process.env.RAZORPAY_KEY_ID,
            deliveryBoyId,
            orderId: razorOrder.id,
            amount: razorOrder.amount,
            currency: razorOrder.currency,
        };
    }

    async verifyDeliveryBoyPayment(data: {
        razorpayOrderId: string;
        razorpayPaymentId: string;
        razorpaySignature: string;
        deliveryBoyId: string;
    }) {
        const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = data;

        const generatedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_SECRET_ID || '')
            .update(razorpayOrderId + '|' + razorpayPaymentId)
            .digest('hex');

        if (generatedSignature !== razorpaySignature) {
            return { success: false, message: 'Invalid signature' };
        }

        await this.repository.updatePaymentStatus(razorpayOrderId, razorpayPaymentId, 'COMPLETED');

        return {
            success: true,
            deliveryBoyId: data.deliveryBoyId,
            paymentId: razorpayPaymentId,
            message: 'Payment verified successfully',
        };
    }
}
