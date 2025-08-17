export interface CreatePaymentDTO {
    amount?: number
    userId: string;
    userName?: string
    cartItems: any[];
    subtotal: number;
    deliveryFee: number;
    tax: number;
    total: number;
    address: string;
    phoneNumber: string;
    paymentMethod: string;
    location: {
        latitude: number;
        longitude: number;
    };
    status?: string;
}

export interface CreatePaymentResponseDTO {
    payment?: any;
    success?: boolean;
    orderId?: string;
    message?: string;
}

export interface CreateUPIPaymentResponseDTO {
    razorpayKey?: string;
    orderId?: string;
    error?: string;
    paymentDbId?: string
}

export interface VerifyUpiPaymentDTO {
    paymentDbId: string;
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
    orderData: any
}

export interface VerifyUpiPaymentResponseDTO {
    orderId?: string;
    success?: boolean;
    error?: string
}

export interface HandleFailedPaymentDTO {
    userId: string;
    paymentDbId: string;
    razorpayOrderId: string;
    razorpayPaymentId: string;
    errorDescription: string;
    errorCode: string;
}

export interface HandleFailedPaymentResponseDTO {
    success: boolean;
    message: string;
}