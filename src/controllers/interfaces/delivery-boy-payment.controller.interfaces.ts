export interface IDeliveryBoyPaymentController {
    createDeliveryBoyPayment(call: any, callback: any): Promise<any>
    verifyDeliveryBoyPayment(call: any, callback: any): Promise<any>
}