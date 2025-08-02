import { IDeliveryBoyPaymentController } from '../interfaces/admin-payment.controller.interfaces';
import { IDeliveryBoyPaymentService } from '../../services/interfaces/admin-payment.service.interfaces';
import { error } from 'console';

export class DeliveryBoyPaymentController implements IDeliveryBoyPaymentController {
    constructor(private deliveryBoyPaymentService: IDeliveryBoyPaymentService) { }

    async createDeliveryBoyPayment(call: any, callback: any): Promise<void> {
        try {
            const { deliveryBoyId, amount, role } = call.request;
            const response = await this.deliveryBoyPaymentService.createDeliveryBoyPayment({ deliveryBoyId, amount, role });
            callback(null, {
                deliveryBoyId: response.deliveryBoyId,
                razorpayKey: response.razorpayKey,
                orderId: response.orderId,
                amount: response.amount,
                currency: response.currency,
                error: response.error
            });
        } catch (error: any) {
            callback(null, {
                error: error.message || 'Failed to create payment',
            });
        }
    }

    async verifyDeliveryBoyPayment(call: any, callback: any): Promise<void> {
        try {
            const response = await this.deliveryBoyPaymentService.verifyDeliveryBoyPayment(call.request);
            callback(null, response);
        } catch (error: any) {
            callback(null, {
                success: false,
                message: error.message || 'Verification failed',
            });
        }
    }

    async cancelDeliveryBoyPayment(call: any, callback: any): Promise<void> {
        try {
            const { deliveryBoyId, orderId, role } = call.request;
            const response = await this.deliveryBoyPaymentService.cancelDeliveryBoyPayment({ deliveryBoyId, orderId, role });
            callback(null, response);
        } catch (error: any) {
            callback(null, {
                success: false,
                message: error.message || 'Failed to cancel payment',
            });
        }
    }

    async getDeliveryBoyInHandPaymentHistory(call: any, callback: any): Promise<void> {
        try {
            console.log('call request :', call.request);
            const { deliveryBoyId, role } = call.request;
            const response = await this.deliveryBoyPaymentService.getDeliveryBoyInHandPaymentHistory({ deliveryBoyId, role });
            callback(null, response);
        } catch (error) {
            callback(null, {
                success: false,
                message: error.message || 'Failed to cancel payment',
            })
        }
    }
}
