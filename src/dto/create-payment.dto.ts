export interface CreatePaymentDto {
    amount?:number
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



export interface CreatePaymentResponseDto {
    payment?: any;
    success?: boolean;
    orderId?: string;
    message?: string;
}