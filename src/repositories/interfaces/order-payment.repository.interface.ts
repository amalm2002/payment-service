import { CreatePaymentDTO } from '../../dto/create-payment.dto';
import { IPayment } from '../../models/interfaces/payment.types';

export interface IPaymentRepository {
    createPayment(data: CreatePaymentDTO): Promise<IPayment>;
    updatePaymentStatus(paymentId: string, status: 'COMPLETED' | 'FAILED',orderId:string): Promise<IPayment>;
}
