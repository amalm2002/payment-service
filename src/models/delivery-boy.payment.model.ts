import mongoose from 'mongoose';

const DeliveryBoyPaymentSchema = new mongoose.Schema({
    deliveryBoyId: {
        type: mongoose.Types.ObjectId,
        required: true,
        ref: 'DeliveryBoy',
    },
    amount: {
        type: Number,
    },
    completeAmount: {
        type: Number,
        default: 0,
    },
    monthlyAmount: {
        type: Number,
        default: 0,
    },
    inHandCash: {
        type: Number,
        default: 0,
    },
    earnings: [{
        date: {
            type: Date,
        },
        amount: {
            type: Number
        },
        paid: {
            type: Boolean,
            default: false,
        },
    }],
    razorpayOrderId: {
        type: String,
    },
    razorpayPaymentId: {
        type: String,
    },
    status: {
        type: String,
        enum: ['PENDING', 'COMPLETED', 'FAILED'],
        default: 'PENDING',
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

export default mongoose.model('DeliveryBoyPayment', DeliveryBoyPaymentSchema);