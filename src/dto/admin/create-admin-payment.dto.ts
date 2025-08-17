export interface CreateDeliveryBoyPaymentDTO {
    deliveryBoyId: string;
    amount: number;
    role: string;
}

export interface CreateDeliveryBoyPaymentResponseDTO {
    razorpayKey?: string;
    deliveryBoyId?: string;
    orderId?: string;
    amount?: number;
    currency?: string;
    error?: string;
}

export interface VerifyDeliveryBoyPaymentDTO {
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
    deliveryBoyId: string;
    role: string;
}

export interface VerifyDeliveryBoyPaymentResponseDTO {
    success: boolean;
    deliveryBoyId?: string;
    paymentId?: string;
    message: string;
    data?: {
        completeAmount: number;
        monthlyAmount: number;
        inHandCash: number;
        earnings: number
    }
}

export interface CancelDeliveryBoyPaymentDTO {
    deliveryBoyId: string;
    orderId: string;
    role: string;
}

export interface CancelDeliveryBoyPaymentResponseDTO {
    success: boolean;
    message: string;
}

export interface GetDeliveryBoyInHandPaymentDTO {
    deliveryBoyId: string;
    role: string;
}

export interface GetDeliveryBoyInHandPaymentResponseDTO {
    success: boolean;
    payments?: any;
    message: string;
}