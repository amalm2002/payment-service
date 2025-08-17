// import { Types } from 'mongoose';
// import { PaymentModel } from '../../models/order.payment.model';
// import { CreatePaymentDTO } from '../../dto/create-payment.dto';
// import { IPaymentRepository } from '../interfaces/order-payment.repository.interface';
// import { IPayment } from '../../models/interfaces/payment.types';


// export class PaymentRepository implements IPaymentRepository {
//     async createPayment(data: CreatePaymentDTO): Promise<IPayment> {
//         const payment = new PaymentModel({
//             ...data,
//             userId: new Types.ObjectId(data.userId),
//         });
//         return await payment.save();
//     }

//     async updatePaymentStatus(paymentId: string, status: 'COMPLETED' | 'FAILED', orderId: string): Promise<IPayment> {
//         try {
//             const updatedPayment = await PaymentModel.findByIdAndUpdate(
//                 paymentId,
//                 {
//                     status,
//                     orderId: new Types.ObjectId(orderId),
//                 },
//                 { new: true }
//             );
//             return updatedPayment;
//         } catch (error) {
//             console.error('Error updating payment status:', error);
//             throw new Error('Failed to update payment status');
//         }
//     }
// }









import { Types } from 'mongoose';
import { PaymentModel } from '../../models/order.payment.model';
import { CreatePaymentDTO } from '../../dto/order/create-payment.dto';
import { IPaymentRepository } from '../interfaces/order-payment.repository.interface';
import { IPayment } from '../../models/interfaces/payment.types';
import { createHash } from 'crypto';

export class PaymentRepository implements IPaymentRepository {
    async createPayment(data: CreatePaymentDTO): Promise<IPayment> {
        const payment = new PaymentModel({
            ...data,
            userId: new Types.ObjectId(data.userId),
        });
        return await payment.save();
    }

    async updatePaymentStatus(paymentId: string, status: 'COMPLETED' | 'FAILED', orderId?: string): Promise<IPayment> {
        try {
            const updateData: any = { status };
            if (orderId) {
                updateData.orderId = new Types.ObjectId(orderId);
            }
            const updatedPayment = await PaymentModel.findByIdAndUpdate(
                paymentId,
                updateData,
                { new: true }
            );
            if (!updatedPayment) {
                throw new Error('Payment not found');
            }
            return updatedPayment;
        } catch (error) {
            console.error('Error updating payment status:', error);
            throw new Error('Failed to update payment status');
        }
    }

    async getCartHash(paymentId: string): Promise<string> {
        const payment = await PaymentModel.findById(paymentId);
        if (!payment || !payment.cartItems) {
            throw new Error('Payment or cart items not found');
        }
        const cartString = JSON.stringify(
            payment.cartItems
                .map((item: any) => ({
                    id: item.id,
                    quantity: item.quantity,
                    price: item.price,
                }))
                .sort((a: any, b: any) => a.id.localeCompare(b.id))
        );
        return createHash('sha256').update(cartString).digest('hex');
    }
}