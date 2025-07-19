import { CreatePaymentDto } from '../../dto/create-payment.dto';

export interface IPaymentService {
  handleCashOnDelivery(data: CreatePaymentDto): Promise<any>;
}
