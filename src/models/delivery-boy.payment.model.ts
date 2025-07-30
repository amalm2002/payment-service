import mongoose from 'mongoose';

const DeliveryBoyPaymentSchema = new mongoose.Schema({
    deliveryBoyId: {
        type: mongoose.Types.ObjectId,
        required: true,
        ref: 'DeliveryBoy',
    },
    amount: {
        type: Number,
        required: true,
    },
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
