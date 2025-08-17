import { CreatePaymentDTO } from '../../dto/order/create-payment.dto';
import { IPayment } from '../../models/interfaces/payment.types';

export interface IPaymentRepository {
    createPayment(data: CreatePaymentDTO): Promise<IPayment>;
    updatePaymentStatus(paymentId: string, status: 'COMPLETED' | 'FAILED', orderId?: string): Promise<IPayment>;
    getCartHash(paymentId: string): Promise<any>
}
