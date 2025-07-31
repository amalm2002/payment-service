export interface IDeliveryBoyPaymentRepository {
    createPayment(data: {
        deliveryBoyId: string;
        amount: number;
        razorpayOrderId: string;
        status: string;
        completeAmount: number;
        monthlyAmount: number;
        inHandCash: number;
        earnings: { date: Date; amount: number; paid: boolean }[];
    }): Promise<any>;
    updatePaymentStatus(
        orderId: string,
        paymentId: string,
        status: string,
        updateData: {
            completeAmount: number;
            monthlyAmount: number;
            inHandCash: number;
            earnings?: { date: Date; amount: number; paid: boolean }[];
        }
    ): Promise<void>;
    findPendingPayment(deliveryBoyId: string): Promise<any>;
    findPaymentByOrderId(orderId: string): Promise<any>;
}