import { CreatePaymentDto, CreatePaymentResponseDto } from '../../dto/create-payment.dto';

export interface IOrderPaymentService {
  handleCashOnDelivery(data: CreatePaymentDto): Promise<CreatePaymentResponseDto>;
  createUpiPaymentOrder(data: any): Promise<any>;
  verifyUpiPayment(data: any): Promise<any>
}
