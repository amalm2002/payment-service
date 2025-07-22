export interface CreatePaymentDTO {
    amount?: number
    userId: string;
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
}

export interface VerifyUpiPaymentDTO {
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