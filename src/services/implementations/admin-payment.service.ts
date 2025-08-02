import Razorpay from 'razorpay';
import { IDeliveryBoyPaymentService } from '../interfaces/admin-payment.service.interfaces';
import { IDeliveryBoyPaymentRepository } from '../../repositories/interfaces/admin-payment.repository.interface';
import RabbitMqDeliveryBoyClient from '../../rabbitmq/delivery-boy-service-connection/client';
import crypto from 'crypto';
import redisClient from '../../config/redis.config';


interface PaymentData {
  deliveryBoyId: string;
  amount: number;
  razorpayOrderId: string;
  status: string;
  inHandCash: number;
  earnings: { date: Date; amount: number; paid: boolean }[];
  role: string;
  completeAmount?: number;
  monthlyAmount?: number;
}

export class DeliveryBoyPaymentService implements IDeliveryBoyPaymentService {
  private razorpay: Razorpay;

  constructor(private repository: IDeliveryBoyPaymentRepository) {
    this.razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID || '',
      key_secret: process.env.RAZORPAY_SECRET_ID || '',
    });
  }

  async createDeliveryBoyPayment(data: { deliveryBoyId: string; amount: number, role: string }) {
    const { deliveryBoyId, amount, role } = data;
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

      const paymentData: PaymentData = {
        deliveryBoyId,
        amount: amount / 100,
        razorpayOrderId: razorOrder.id,
        status: 'PENDING',
        inHandCash: 0,
        earnings: [],
        role: role.toUpperCase(),
      };


      if (role.toUpperCase() === 'ADMIN') {
        paymentData.completeAmount = 0;
        paymentData.monthlyAmount = 0;
      }

      const payment = await this.repository.createPayment(paymentData);

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
    role: string;
  }) {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, deliveryBoyId, role } = data;
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

      // const operation = 'Update-Delivery-Boy-Earnings';
      const operation = role.toUpperCase() === 'ADMIN' ? 'Update-Delivery-Boy-Earnings' : 'Clear-In-Hand-Cash';
      const updateDeliveryBoyEarnings = await RabbitMqDeliveryBoyClient.produce(paymentData, operation);

      if (!updateDeliveryBoyEarnings.success) {
        return { success: false, message: `Failed to ${role.toUpperCase() === 'ADMIN' ? 'update delivery boy earnings' : 'clear in-hand cash'}` };
      }

      console.log('updatedDeliveryBoyEarnigs :', updateDeliveryBoyEarnings);


      const { completeAmount, monthlyAmount, inHandCash, earnings, amountToPayDeliveryBoy } = updateDeliveryBoyEarnings.data;

      const updateData: any = {
        inHandCash,
        earnings,
      };

      if (role.toUpperCase() === 'ADMIN') {
        updateData.completeAmount = completeAmount;
        updateData.monthlyAmount = monthlyAmount;
      } else {
        updateData.completeAmount = 0;
        updateData.monthlyAmount = 0;
      }

      await this.repository.updatePaymentStatus(razorpayOrderId, razorpayPaymentId, 'COMPLETED', {
        completeAmount,
        monthlyAmount,
        inHandCash,
        amountToPayDeliveryBoy,
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

  async cancelDeliveryBoyPayment(data: { deliveryBoyId: string; orderId: string; role: string; }) {
    const { deliveryBoyId, orderId, role } = data;
    const lockKey = `payment:lock:${deliveryBoyId}`;

    try {
      const payment = await this.repository.findPaymentByOrderId(orderId);
      if (!payment || payment.status !== 'PENDING') {
        return { success: false, message: 'No pending payment found or payment already processed' };
      }

      const updateData: any = {
        inHandCash: 0,
      };

      if (role.toUpperCase() === 'ADMIN') {
        updateData.completeAmount = 0;
        updateData.monthlyAmount = 0;
      }

      await this.repository.updatePaymentStatus(orderId, null, 'CANCELLED', updateData);

      await redisClient.del(lockKey);

      return { success: true, message: 'Payment cancelled successfully' };
    } catch (error: any) {
      return { success: false, message: error.message || 'Failed to cancel payment' };
    }
  }

  async getDeliveryBoyInHandPaymentHistory(data: { deliveryBoyId: string; role: string; }): Promise<any> {
    const { deliveryBoyId, role } = data
    try {
      const formattedRole = role.toUpperCase()
      const paymentsData = await this.repository.findPaymentsHistory(deliveryBoyId, formattedRole)
      if (paymentsData.length === 0) {
        return { success: false, message: ' No In-Hand payment history' }
      } else {
        // console.log('paymentData :', paymentsData);
        return { success: true, payments: paymentsData, message: 'In-Hand payment history fetch successfully' }
      }
    } catch (error) {
      return { success: false, message: error.message || 'Failed to cancel payment' };
    }
  }
}