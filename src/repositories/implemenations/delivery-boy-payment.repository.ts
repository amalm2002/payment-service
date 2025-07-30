import DeliveryBoyPayment from '../../models/delivery-boy.payment.model';
import { IDeliveryBoyPaymentRepository } from '../interfaces/delivery-boy-payment.repository.interface';

export class DeliveryBoyPaymentRepository implements IDeliveryBoyPaymentRepository {
    async createPayment(data: { deliveryBoyId: string; amount: number; razorpayOrderId: string }) {
        return await DeliveryBoyPayment.create(data);
    }

    async updatePaymentStatus(orderId: string, paymentId: string, status: string) {
        await DeliveryBoyPayment.findOneAndUpdate(
            { razorpayOrderId: orderId },
            {
                status,
                razorpayPaymentId: paymentId,
            }
        );
    }
}