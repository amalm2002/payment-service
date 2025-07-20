import { PaymentModel } from '../../models/payment.model';
import { CreatePaymentDto } from '../../dto/create-payment.dto';
import { IPaymentRepository } from '../interfaces/payment.repository.interface';

export class PaymentRepository implements IPaymentRepository {
    async createPayment(data: CreatePaymentDto): Promise<any> {
        const payment = new PaymentModel(data);
        return await payment.save();
    }
    async updatePaymentStatus(paymentId: string, status: 'COMPLETED' | 'FAILED', orderId: string): Promise<any> {
        try {
            const updatedPayment = await PaymentModel.findByIdAndUpdate(
                paymentId,
                {
                    status,
                    orderId,
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