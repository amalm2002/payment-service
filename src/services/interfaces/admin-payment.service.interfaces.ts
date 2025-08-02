export interface IDeliveryBoyPaymentService {
    createDeliveryBoyPayment(data: { deliveryBoyId: string; amount: number, role: string }): Promise<any>;
    verifyDeliveryBoyPayment(data: {
        razorpayOrderId: string;
        razorpayPaymentId: string;
        razorpaySignature: string;
        deliveryBoyId: string;
        role: string
    }): Promise<any>;
    cancelDeliveryBoyPayment(data: { deliveryBoyId: string, orderId: string, role: string }): Promise<any>
    getDeliveryBoyInHandPaymentHistory(data: { deliveryBoyId: string, role: string }): Promise<any>
}