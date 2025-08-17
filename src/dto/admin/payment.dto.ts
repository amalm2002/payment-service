export interface PaymentData {
    deliveryBoyId: string;
    amount: number;
    razorpayOrderId: string;
    status: string;
    inHandCash: number;
    earnings: { date: Date; amount: number; paid: boolean }[];
    role: string;
    completeAmount?: number;
    monthlyAmount?: number;
}
