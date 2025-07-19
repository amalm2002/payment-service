export interface CreatePaymentDto {
    userId: string;
    cartItems: any[];
    subtotal: number;
    deliveryFee: number;
    tax: number;
    total: number;
    address: string;
    phoneNumber: string;
    paymentMethod: string;
}