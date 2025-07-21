import mongoose, { Schema, Model } from 'mongoose';
import { IPayment } from './interfaces/payment.types';

const paymentSchema: Schema<IPayment> = new mongoose.Schema(
    {
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        orderId: { type: Schema.Types.ObjectId, ref: 'Order' },
        cartItems: {
            type: [
                {
                    id: { type: String, required: true },
                    name: { type: String, required: true },
                    description: { type: String },
                    price: { type: Number, required: true },
                    quantity: { type: Number, required: true },
                    restaurantId: { type: String, required: true },
                    restaurant: { type: String },
                    category: { type: String },
                    discount: { type: Number },
                    timing: { type: String },
                    rating: { type: Number },
                    hasVariants: { type: Boolean },
                    images: [{ type: String }],
                    variants: [{ type: Schema.Types.Mixed }],
                },
            ],
            required: true,
        },
        subtotal: Number,
        deliveryFee: Number,
        tax: Number,
        total: Number,
        address: String,
        phoneNumber: String,
        paymentMethod: String,
        status: { type: String, default: 'PENDING' },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
    }
);

paymentSchema.virtual('createdAtUTC').get(function () {
    return this.createdAt?.toISOString();
});

export const PaymentModel: Model<IPayment> = mongoose.model<IPayment>('Payment', paymentSchema);
