import { PaymentRepository } from '../../repositories/implemenations/payment.repository';
import { PaymentService } from '../../services/implementations/payment.service';
import { CreatePaymentDto } from '../../dto/create-payment.dto';

const repository = new PaymentRepository();
const service = new PaymentService(repository);

export class OrderPaymentController {
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

        const paymentResult = await service.handleCashOnDelivery(paymentDto);

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

}