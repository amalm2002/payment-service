import 'dotenv/config'
import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import connectDB from './config/mongo.config';
import path from 'path';
import { OrderPaymentController } from './controllers/implementaions/order-payment.controller';
import { IOrderPaymentController } from './controllers/interfaces/order-payment.controller.interface';
import { OrderPaymentService } from './services/implementations/order-payment.service';
import { PaymentRepository } from './repositories/implemenations/order-payment.repository';
import { DeliveryBoyPaymentController } from './controllers/implementaions/delivery-boy-payment.controller';
import { IDeliveryBoyPaymentController } from './controllers/interfaces/delivery-boy-payment.controller.interfaces';
import { DeliveryBoyPaymentRepository } from './repositories/implemenations/delivery-boy-payment.repository';
import { DeliveryBoyPaymentService } from './services/implementations/delivery-boy-payment.service';

connectDB()

const repository = new PaymentRepository();
const service = new OrderPaymentService(repository);

const deliveryBoyPaymentRepository = new DeliveryBoyPaymentRepository()
const deliveryBoyPaymentService=new DeliveryBoyPaymentService(deliveryBoyPaymentRepository)

const orderPaymentController: IOrderPaymentController = new OrderPaymentController(service);
const deliveryBoyPaymentController: IDeliveryBoyPaymentController = new DeliveryBoyPaymentController(deliveryBoyPaymentService)

const packageDef = protoLoader.loadSync(path.resolve(__dirname, './proto/payment.proto'), {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true
})

const grpcObject = grpc.loadPackageDefinition(packageDef) as unknown as any
const paymentProto = grpcObject.payment_package;

if (!paymentProto || !paymentProto.PaymentService || !paymentProto.PaymentService.service) {
    console.error("Failed to load the Payment service from the proto file.");
    process.exit(1);
}

const server = new grpc.Server()

server.addService(paymentProto.PaymentService.service, {
    PlaceOrder: orderPaymentController.placeOrder.bind(orderPaymentController),
    CreateOrderPayment: orderPaymentController.createOrderPayment.bind(orderPaymentController),
    VerifyUpiPayment: orderPaymentController.verifyUpiPayment.bind(orderPaymentController),
    CreateDeliveryBoyPayment: deliveryBoyPaymentController.createDeliveryBoyPayment.bind(deliveryBoyPaymentController),
    VerifyDeliveryBoyPayment: deliveryBoyPaymentController.verifyDeliveryBoyPayment.bind(deliveryBoyPaymentController),
})

const grpcServer = () => {
    const port = process.env.PORT || '3008'
    const Domain = process.env.NODE_ENV === 'dev' ? process.env.DEV_DOMAIN : process.env.PRO_DOMAIN_USER;

    server.bindAsync(`${Domain}:${port}`, grpc.ServerCredentials.createInsecure(), (err, bindPort) => {
        if (err) {
            console.error("Error starting gRPC server:", err)
            return
        }
        console.log(`gRPC user server started on port:${bindPort}`);
    })
}

grpcServer()