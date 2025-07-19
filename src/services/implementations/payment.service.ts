import { IPaymentService } from '../interfaces/payment.service.interface';
import { CreatePaymentDto } from '../../dto/create-payment.dto';
import { IPaymentRepository } from '../../repositories/interfaces/payment.repository.interface';
import RabbitMqClient from '../../rabbitmq/client';

export class PaymentService implements IPaymentService {
    constructor(private readonly paymentRepository: IPaymentRepository) {}

    async handleCashOnDelivery(data: CreatePaymentDto) {
        const payment = await this.paymentRepository.createPayment(data);

        const operation = 'Create-COD-Order';

        const result = await RabbitMqClient.produce(data, operation);

        console.log('Order service replied with:', result);

        // Optionally update payment status
        // await this.paymentRepository.updatePaymentStatus(payment.id, result?.status === 'success' ? 'COMPLETED' : 'FAILED');

        return payment;
    }
}