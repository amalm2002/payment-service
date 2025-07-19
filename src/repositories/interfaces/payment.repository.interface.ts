import { CreatePaymentDto } from '../../dto/create-payment.dto';

export interface IPaymentRepository {
    createPayment(data: CreatePaymentDto): Promise<any>;
}
