import {
    CancelDeliveryBoyPaymentDTO,
    CancelDeliveryBoyPaymentResponseDTO,
    CreateDeliveryBoyPaymentDTO,
    CreateDeliveryBoyPaymentResponseDTO,
    GetDeliveryBoyInHandPaymentDTO,
    GetDeliveryBoyInHandPaymentResponseDTO,
    VerifyDeliveryBoyPaymentDTO,
    VerifyDeliveryBoyPaymentResponseDTO
} from "../../dto/admin/create-admin-payment.dto";

export interface IDeliveryBoyPaymentService {
    createDeliveryBoyPayment(paymentCreationRequest: CreateDeliveryBoyPaymentDTO): Promise<CreateDeliveryBoyPaymentResponseDTO>;
    verifyDeliveryBoyPayment(paymentVerificationRequest: VerifyDeliveryBoyPaymentDTO): Promise<VerifyDeliveryBoyPaymentResponseDTO>;
    cancelDeliveryBoyPayment(paymentCancellationRequest: CancelDeliveryBoyPaymentDTO): Promise<CancelDeliveryBoyPaymentResponseDTO>
    getDeliveryBoyInHandPaymentHistory(paymentHistoryRequest: GetDeliveryBoyInHandPaymentDTO): Promise<GetDeliveryBoyInHandPaymentResponseDTO>
}