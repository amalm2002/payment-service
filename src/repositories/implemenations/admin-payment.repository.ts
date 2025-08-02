import DeliveryBoyPayment from '../../models/delivery-boy.payment.model';
import { IDeliveryBoyPaymentRepository } from '../interfaces/admin-payment.repository.interface';

export class DeliveryBoyPaymentRepository implements IDeliveryBoyPaymentRepository {
    async createPayment(data: {
        deliveryBoyId: string;
        amount: number;
        razorpayOrderId: string;
        status: string;
        completeAmount?: number;
        monthlyAmount?: number;
        inHandCash: number;
        amountToPayDeliveryBoy?: number;
        earnings?: { date: Date; amount: number; paid: boolean }[];
        role: string;
    }) {
        return await DeliveryBoyPayment.create(data);
    }

    async updatePaymentStatus(
        orderId: string,
        paymentId: string | null,
        status: string,
        updateData: {
            completeAmount?: number;
            monthlyAmount?: number;
            inHandCash: number;
            amountToPayDeliveryBoy?: number;
            earnings?: { date: Date; amount: number; paid: boolean }[];
        }
    ) {
        const update: any = {
            status,
            inHandCash: updateData.inHandCash,
        };

        if (updateData.completeAmount !== undefined) {
            update.completeAmount = updateData.completeAmount;
        }

        if (updateData.monthlyAmount !== undefined) {
            update.monthlyAmount = updateData.monthlyAmount;
        }

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

    async findPaymentsHistory(deliveryBoyId: string, role: string): Promise<any> {
        return await DeliveryBoyPayment.find({ deliveryBoyId: deliveryBoyId, role: role })
    }
}