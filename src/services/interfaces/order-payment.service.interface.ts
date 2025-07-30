import { CreatePaymentDTO, CreatePaymentResponseDTO, CreateUPIPaymentResponseDTO, VerifyUpiPaymentDTO, VerifyUpiPaymentResponseDTO } from '../../dto/create-payment.dto';

export interface IOrderPaymentService {
  handleCashOnDelivery(data: CreatePaymentDTO): Promise<CreatePaymentResponseDTO>;
  createUpiPaymentOrder(data: CreatePaymentDTO): Promise<CreateUPIPaymentResponseDTO>;
  verifyUpiPayment(data: VerifyUpiPaymentDTO): Promise<VerifyUpiPaymentResponseDTO>
}
