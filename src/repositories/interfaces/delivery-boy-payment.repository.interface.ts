export interface IDeliveryBoyPaymentRepository {
    createPayment(data: { deliveryBoyId: string; amount: number; razorpayOrderId: string }): Promise<any>;
    updatePaymentStatus(orderId: string, paymentId: string, status: string): Promise<void>;
}