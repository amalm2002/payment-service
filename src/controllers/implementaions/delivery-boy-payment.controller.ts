import { IDeliveryBoyPaymentController } from '../interfaces/delivery-boy-payment.controller.interfaces';
import { IDeliveryBoyPaymentService } from '../../services/interfaces/delivery-boy-payment.service.interfaces';

export class DeliveryBoyPaymentController implements IDeliveryBoyPaymentController {
    constructor(private deliveryBoyPaymentService: IDeliveryBoyPaymentService) { }

    async createDeliveryBoyPayment(call: any, callback: any): Promise<void> {
        try {
            const { deliveryBoyId, amount } = call.request;
            const response = await this.deliveryBoyPaymentService.createDeliveryBoyPayment({ deliveryBoyId, amount });
            callback(null, {
                deliveryBoyId: response.deliveryBoyId,
                razorpayKey: response.razorpayKey,
                orderId: response.orderId,
                amount: response.amount,
                currency: response.currency,
            });
        } catch (error: any) {
            callback(null, {
                error: error.message || 'Failed to create payment',
            });
        }
    }

    async verifyDeliveryBoyPayment(call: any, callback: any): Promise<void> {
        try {
            console.log('call data on verify data :', call.request);
            const response = await this.deliveryBoyPaymentService.verifyDeliveryBoyPayment(call.request);
            callback(null, response);
        } catch (error: any) {
            callback(null, {
                success: false,
                message: error.message || 'Verification failed',
            });
        }
    }
}
