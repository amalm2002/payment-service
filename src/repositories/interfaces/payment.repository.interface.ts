import { CreatePaymentDto } from '../../dto/create-payment.dto';

export interface IPaymentRepository {
    createPayment(data: CreatePaymentDto): Promise<any>;
    updatePaymentStatus(paymentId: string, status: 'COMPLETED' | 'FAILED',orderId:string): Promise<any>;
}
