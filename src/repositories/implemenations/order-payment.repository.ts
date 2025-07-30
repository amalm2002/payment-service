import { Types } from 'mongoose';
import { PaymentModel } from '../../models/order.payment.model';
import { CreatePaymentDTO } from '../../dto/create-payment.dto';
import { IPaymentRepository } from '../interfaces/order-payment.repository.interface';
import { IPayment } from '../../models/interfaces/payment.types';


export class PaymentRepository implements IPaymentRepository {
    async createPayment(data: CreatePaymentDTO): Promise<IPayment> {
        const payment = new PaymentModel({
            ...data,
            userId: new Types.ObjectId(data.userId),
        });
        return await payment.save();
    }

    async updatePaymentStatus(paymentId: string, status: 'COMPLETED' | 'FAILED', orderId: string): Promise<IPayment> {
        try {
            const updatedPayment = await PaymentModel.findByIdAndUpdate(
                paymentId,
                {
                    status,
                    orderId: new Types.ObjectId(orderId),
                },
                { new: true }
            );
            return updatedPayment;
        } catch (error) {
            console.error('Error updating payment status:', error);
            throw new Error('Failed to update payment status');
        }
    }
}
