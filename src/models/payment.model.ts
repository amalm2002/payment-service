import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    orderId: { type: String },
    cartItems: { type: Array, required: true },
    subtotal: Number,
    deliveryFee: Number,
    tax: Number,
    total: Number,
    address: String,
    phoneNumber: String,
    paymentMethod: String,
    status: { type: String, default: 'PENDING' },
}, { timestamps: true });

export const PaymentModel = mongoose.model('Payment', paymentSchema);