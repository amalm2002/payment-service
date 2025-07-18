import 'dotenv/config'
import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import connectDB from './config/mongo.config';
import path from 'path';
import { OrderPaymentController } from './controllers/implementaions/order-payment.controller';


connectDB()

const orderPaymentController = new OrderPaymentController()

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
    PlaceOrder: orderPaymentController.placeOrder
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