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
    createDeliveryBoyPayment(data: CreateDeliveryBoyPaymentDTO): Promise<CreateDeliveryBoyPaymentResponseDTO>;
    verifyDeliveryBoyPayment(data: VerifyDeliveryBoyPaymentDTO): Promise<VerifyDeliveryBoyPaymentResponseDTO>;
    cancelDeliveryBoyPayment(data: CancelDeliveryBoyPaymentDTO): Promise<CancelDeliveryBoyPaymentResponseDTO>
    getDeliveryBoyInHandPaymentHistory(data: GetDeliveryBoyInHandPaymentDTO): Promise<GetDeliveryBoyInHandPaymentResponseDTO>
}