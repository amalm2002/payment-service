import { PaymentModel } from '../../models/payment.model';
import { CreatePaymentDto } from '../../dto/create-payment.dto';
import { IPaymentRepository } from '../interfaces/payment.repository.interface';

export class PaymentRepository implements IPaymentRepository {
    async createPayment(data: CreatePaymentDto): Promise<any> {
        const payment = new PaymentModel(data);
        return await payment.save();
    }
}