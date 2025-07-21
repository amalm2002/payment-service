import { CreatePaymentDto } from '../../dto/create-payment.dto';
import { IOrderPaymentController } from '../interfaces/order-payment.controller.interface';
import { IOrderPaymentService } from '../../services/interfaces/payment.service.interface';

export class OrderPaymentController implements IOrderPaymentController {
    private orderPaymentService: IOrderPaymentService

    constructor(orderPaymentService: IOrderPaymentService) {
        this.orderPaymentService = orderPaymentService
    }

    async placeOrder(call: any, callback: any): Promise<void> {
        try {
            const data = call.request;
            const paymentDto: CreatePaymentDto = {
                userId: data.userId,
                cartItems: data.cartItems,
                subtotal: data.subtotal,
                deliveryFee: data.deliveryFee,
                tax: data.tax,
                total: data.total,
                address: data.address,
                phoneNumber: data.phoneNumber,
                paymentMethod: data.paymentMethod,
                location: data.location,
            };
            const paymentResult = await this.orderPaymentService.handleCashOnDelivery(paymentDto);
            callback(null, {
                message: 'Order placed successfully',
                paymentId: paymentResult.payment._id,
                orderId: paymentResult.orderId,
                success: paymentResult.success,
            });

        } catch (error) {
            console.error('Error in placeOrder:', error);
            callback(error);
        }
    }

    async createOrderPayment(call: any, callback: any): Promise<void> {
        try {
            const data = call.request;
            const paymentDto: any = {
                amount: data.amount,
                userId: data.userId,
                cartItems: data.cartItems,
                subtotal: data.subtotal,
                deliveryFee: data.deliveryFee,
                tax: data.tax,
                total: data.total,
                address: data.address,
                phoneNumber: data.phoneNumber,
                paymentMethod: data.paymentMethod,
                location: data.location,
            };
            const paymentResult = await this.orderPaymentService.createUpiPaymentOrder(paymentDto);
            callback(null, {
                razorpayKey: paymentResult.razorpayKey,
                orderId: paymentResult.orderId,
            });
        } catch (error) {
            console.error('Error in upi payment controller side :', error);
            callback(error);
        }
    }

  async verifyUpiPayment(call: any, callback: any) {
    try {
        const response = await this.orderPaymentService.verifyUpiPayment(call.request);
        callback(null, {
            success: response.success,
            message: response.success ? "Order created successfully" : response.error,
            orderId: response.orderId || ""
        });
    } catch (error: any) {
        console.error('Error in UPI Payment Verification:', error);
        callback({
            code: 13,
            message: error.message || 'Internal error'
        });
    }
}
}