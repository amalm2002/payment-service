import { IOrderPaymentService } from '../interfaces/payment.service.interface';
import { CreatePaymentDto, CreatePaymentResponseDto } from '../../dto/create-payment.dto';
import { IPaymentRepository } from '../../repositories/interfaces/payment.repository.interface';
import RabbitMqClient from '../../rabbitmq/client';

export class OrderPaymentService implements IOrderPaymentService {
    constructor(private readonly paymentRepository: IPaymentRepository) { }

    async handleCashOnDelivery(data: CreatePaymentDto): Promise<CreatePaymentResponseDto> {
        try {
            const payment = await this.paymentRepository.createPayment(data);
            const operation = 'Create-COD-Order';
            const result = await RabbitMqClient.produce(data, operation);
            await this.paymentRepository.updatePaymentStatus(
                payment.id,
                result?.success ? 'COMPLETED' : 'FAILED',
                result.orderId
            );

            return {
                payment,
                success: result?.success,
                orderId: result?.orderId.toString()
            };
        } catch (error: any) {
            return { message: (error as Error).message, success: false }
        }
    }

}