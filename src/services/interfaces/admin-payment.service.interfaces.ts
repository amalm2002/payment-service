export interface IDeliveryBoyPaymentService {
    createDeliveryBoyPayment(data: { deliveryBoyId: string; amount: number }): Promise<any>;
    verifyDeliveryBoyPayment(data: {
        razorpayOrderId: string;
        razorpayPaymentId: string;
        razorpaySignature: string;
        deliveryBoyId: string;
    }): Promise<any>;
    cancelDeliveryBoyPayment(data: { deliveryBoyId: string, orderId: string }): Promise<any>
}