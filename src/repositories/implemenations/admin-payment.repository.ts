import DeliveryBoyPayment from '../../models/delivery-boy.payment.model';
import { IDeliveryBoyPaymentRepository } from '../interfaces/admin-payment.repository.interface';

export class DeliveryBoyPaymentRepository implements IDeliveryBoyPaymentRepository {
    async createPayment(data: {
        deliveryBoyId: string;
        amount: number;
        razorpayOrderId: string;
        completeAmount: number;
        monthlyAmount: number;
        inHandCash: number;
        earnings: { date: Date; amount: number; paid: boolean }[];
    }) {
        return await DeliveryBoyPayment.create(data);
    }

    async updatePaymentStatus(
        orderId: string,
        paymentId: string | null,
        status: string,
        updateData: {
            completeAmount: number;
            monthlyAmount: number;
            inHandCash: number;
            earnings?: { date: Date; amount: number; paid: boolean }[];
        }
    ) {
        const update: any = {
            status,
            $inc: {
                completeAmount: updateData.completeAmount,
                monthlyAmount: updateData.monthlyAmount,
                inHandCash: updateData.inHandCash,
            },
        };

        if (paymentId) {
            update.razorpayPaymentId = paymentId;
        }

        if (Array.isArray(updateData.earnings) && updateData.earnings.length > 0) {
            update.$push = { earnings: { $each: updateData.earnings } };
        }

        await DeliveryBoyPayment.findOneAndUpdate({ razorpayOrderId: orderId }, update);
    }

    async findPendingPayment(deliveryBoyId: string) {
        return await DeliveryBoyPayment.findOne({
            deliveryBoyId,
            status: 'PENDING',
        });
    }

    async findPaymentByOrderId(orderId: string) {
        return await DeliveryBoyPayment.findOne({ razorpayOrderId: orderId });
    }
}