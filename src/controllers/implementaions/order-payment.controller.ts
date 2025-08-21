import { CreatePaymentDTO, VerifyUpiPaymentDTO } from '../../dto/order/create-payment.dto';
import { IOrderPaymentController } from '../interfaces/order-payment.controller.interface';
import { IOrderPaymentService } from '../../services/interfaces/order-payment.service.interface';


export class OrderPaymentController implements IOrderPaymentController {

    constructor(
        private readonly _orderPaymentService: IOrderPaymentService
    ) { }

    async placeOrder(call: any, callback: any): Promise<void> {
        try {
            const data = call.request;
            const paymentDto: CreatePaymentDTO = {
                userId: data.userId,
                userName: data.userName,
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
            const paymentResult = await this._orderPaymentService.handleCashOnDelivery(paymentDto);
            callback(null, {
                message: 'Order placed successfully',
                paymentId: paymentResult.payment._id,
                orderId: paymentResult.orderId,
                success: paymentResult.success,
                orderNumber:paymentResult.orderNumber
            });

        } catch (error) {
            console.error('Error in placeOrder:', error);
            callback(error);
        }
    }

    async createOrderPayment(call: any, callback: any): Promise<void> {
        try {
            const data = call.request;
            const paymentDto: CreatePaymentDTO = {
                amount: data.amount,
                userId: data.userId,
                userName: data.userName,
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
            const paymentResult = await this._orderPaymentService.createUpiPaymentOrder(paymentDto);
            callback(null, {
                razorpayKey: paymentResult.razorpayKey,
                orderId: paymentResult.orderId,
                error: paymentResult.error,
                paymentDbId: paymentResult.paymentDbId
            });
        } catch (error) {
            console.error('Error in upi payment controller side :', error);
            callback(error);
        }
    }

    async verifyUpiPayment(call: any, callback: any): Promise<void> {
        try {
            const data = call.request
            const verifyUpiPayment: VerifyUpiPaymentDTO = {
                paymentDbId: data.paymentIdDB,
                razorpayOrderId: data.razorpayOrderId,
                razorpayPaymentId: data.razorpayPaymentId,
                razorpaySignature: data.razorpaySignature,
                orderData: data.orderData
            }
            const response = await this._orderPaymentService.verifyUpiPayment(verifyUpiPayment);
            callback(null, {
                success: response.success,
                message: response.success ? "Order created successfully" : response.error,
                orderId: response.orderId || "",
                orderNumber:response.orderNumber
            });
        } catch (error: any) {
            console.error('Error in UPI Payment Verification:', error);
            callback({
                code: 13,
                message: error.message || 'Internal error'
            });
        }
    }


    async handleFailedPayment(call: any, callback: any): Promise<void> {
        try {
            const data = call.request;
            const failedPaymentDto = {
                paymentDbId: data.paymentDbId,
                userId: data.userId,
                razorpayOrderId: data.razorpayOrderId,
                razorpayPaymentId: data.razorpayPaymentId,
                errorDescription: data.errorDescription,
                errorCode: data.errorCode,
            };
            const response = await this._orderPaymentService.handleFailedPayment(failedPaymentDto);
            callback(null, {
                success: response.success,
                message: response.message,
            });
        } catch (error: any) {
            console.error('Error in handleFailedPayment:', error);
            callback({
                code: 13,
                message: error.message || 'Internal error',
            });
        }
    }
}