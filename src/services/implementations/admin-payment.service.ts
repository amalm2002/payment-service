import Razorpay from 'razorpay';
import { IDeliveryBoyPaymentService } from '../interfaces/admin-payment.service.interfaces';
import { IDeliveryBoyPaymentRepository } from '../../repositories/interfaces/admin-payment.repository.interface';
import RabbitMqDeliveryBoyClient from '../../rabbitmq/delivery-boy-service-connection/client';
import crypto from 'crypto';
import redisClient from '../../config/redis.config';

export class DeliveryBoyPaymentService implements IDeliveryBoyPaymentService {
  private razorpay: Razorpay;

  constructor(private repository: IDeliveryBoyPaymentRepository) {
    this.razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID || '',
      key_secret: process.env.RAZORPAY_SECRET_ID || '',
    });
  }

  async createDeliveryBoyPayment(data: { deliveryBoyId: string; amount: number }) {
    const { deliveryBoyId, amount } = data;
    const lockKey = `payment:lock:${deliveryBoyId}`;
    const lockTimeout = 1 * 60 * 1000; 

    if (!Number.isInteger(amount) || amount <= 0) {
      return { error: `Invalid amount: ${amount}. Must be a positive integer in paise.` };
    }

    const lock = await redisClient.set(lockKey, 'locked', { NX: true, PX: lockTimeout });

    if (!lock) {
      return { error: 'A payment is already in progress for this delivery boy. Please try again later.' };
    }

    try {
      const pendingPayment = await this.repository.findPendingPayment(deliveryBoyId);

      if (pendingPayment) {
        const paymentAge = Date.now() - new Date(pendingPayment.createdAt).getTime();

        if (paymentAge < lockTimeout) {
          return { error: 'A pending payment already exists. Please complete it or try again after a few minutes.' };
        }

        try {
          await this.repository.updatePaymentStatus(pendingPayment.razorpayOrderId, null, 'CANCELLED', {
            completeAmount: 0,
            monthlyAmount: 0,
            inHandCash: 0,
          });
        } catch (cancelError) {
          console.error('Failed to cancel old pending payment:', cancelError);
        }
      }

      const shortDeliveryBoyId = deliveryBoyId.slice(0, 10);
      const randomSuffix = Math.floor(100000 + Math.random() * 900000).toString(); 
      const receipt = `rcpt_${shortDeliveryBoyId}_${randomSuffix}`;
      if (receipt.length > 40) {
        console.error('Generated receipt too long:', receipt);
        throw new Error('Generated receipt exceeds 40 characters');
      }

      let razorOrder;
      try {
        razorOrder = await this.razorpay.orders.create({
          amount,
          currency: 'INR',
          receipt,
        });
      } catch (razorError: any) {
        console.error('Razorpay order creation failed:', {
          error: razorError,
          message: razorError.message,
          stack: razorError.stack,
          details: razorError.error || razorError,
        });
        throw razorError;
      }

  
      const payment = await this.repository.createPayment({
        deliveryBoyId,
        amount: amount / 100, 
        razorpayOrderId: razorOrder.id,
        status: 'PENDING',
        completeAmount: 0,
        monthlyAmount: 0,
        inHandCash: 0,
        earnings: [],
      });

      return {
        razorpayKey: process.env.RAZORPAY_KEY_ID,
        deliveryBoyId,
        orderId: razorOrder.id,
        amount: razorOrder.amount,
        currency: razorOrder.currency,
      };
    } catch (error: any) {
      console.error('Error in createDeliveryBoyPayment:', {
        message: error.message,
        stack: error.stack,
        error,
      });
      return { error: error.message || 'Failed to create payment' };
    } finally {
      const pendingPayment = await this.repository.findPendingPayment(deliveryBoyId);
      if (!pendingPayment) {
        console.log('Releasing Redis lock:', lockKey);
        await redisClient.del(lockKey);
      }
    }
  }

  async verifyDeliveryBoyPayment(data: {
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
    deliveryBoyId: string;
  }) {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, deliveryBoyId } = data;
    const lockKey = `payment:lock:${deliveryBoyId}`;

    try {
      const generatedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_SECRET_ID || '')
        .update(razorpayOrderId + '|' + razorpayPaymentId)
        .digest('hex');

      if (generatedSignature !== razorpaySignature) {
        return { success: false, message: 'Invalid signature' };
      }
      const payment = await this.repository.findPaymentByOrderId(razorpayOrderId);
      if (!payment) {
        return { success: false, message: 'Payment not found' };
      }

      const paymentData = {
        deliveryBoyId,
        amount: payment.amount,
        date: new Date().toISOString(),
        paid: true,
        paymentId: razorpayPaymentId,
      };

      const operation = 'Update-Delivery-Boy-Earnings';
      const updateDeliveryBoyEarnings = await RabbitMqDeliveryBoyClient.produce(paymentData, operation);

      if (!updateDeliveryBoyEarnings.success) {
        return { success: false, message: 'Failed to update delivery boy earnings' };
      }

      const { completeAmount, monthlyAmount, inHandCash, earnings } = updateDeliveryBoyEarnings.data;

      await this.repository.updatePaymentStatus(razorpayOrderId, razorpayPaymentId, 'COMPLETED', {
        completeAmount,
        monthlyAmount,
        inHandCash,
        earnings, 
      });

      await redisClient.del(lockKey);

      return {
        success: true,
        deliveryBoyId,
        paymentId: razorpayPaymentId,
        message: 'Payment verified and earnings updated successfully',
        data: { completeAmount, monthlyAmount, inHandCash, earnings },
      };
    } catch (error: any) {
      return { success: false, message: error.message || 'Verification failed' };
    }
  }

  async cancelDeliveryBoyPayment(data: { deliveryBoyId: string; orderId: string }) {
    const { deliveryBoyId, orderId } = data;
    const lockKey = `payment:lock:${deliveryBoyId}`;

    try {
      const payment = await this.repository.findPaymentByOrderId(orderId);
      if (!payment || payment.status !== 'PENDING') {
        return { success: false, message: 'No pending payment found or payment already processed' };
      }

      await this.repository.updatePaymentStatus(orderId, null, 'CANCELLED', {
        completeAmount: 0,
        monthlyAmount: 0,
        inHandCash: 0,
      });

      await redisClient.del(lockKey);

      return { success: true, message: 'Payment cancelled successfully' };
    } catch (error: any) {
      return { success: false, message: error.message || 'Failed to cancel payment' };
    }
  }
}