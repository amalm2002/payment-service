import { CreatePaymentDTO, CreatePaymentResponseDTO, CreateUPIPaymentResponseDTO, HandleFailedPaymentDTO, HandleFailedPaymentResponseDTO, VerifyUpiPaymentDTO, VerifyUpiPaymentResponseDTO } from '../../dto/order/create-payment.dto';

export interface IOrderPaymentService {
  handleCashOnDelivery(cashPaymentRequest: CreatePaymentDTO): Promise<CreatePaymentResponseDTO>;
  createUpiPaymentOrder(upiPaymentRequest: CreatePaymentDTO): Promise<CreateUPIPaymentResponseDTO>;
  verifyUpiPayment(upiPaymentVerificationRequest: VerifyUpiPaymentDTO): Promise<VerifyUpiPaymentResponseDTO>
  handleFailedPayment(failedPaymentRequest: HandleFailedPaymentDTO): Promise<HandleFailedPaymentResponseDTO>;
}
