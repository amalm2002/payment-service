export interface IDeliveryBoyPaymentController {
    createDeliveryBoyPayment(call: any, callback: any): Promise<any>
    verifyDeliveryBoyPayment(call: any, callback: any): Promise<any>
    cancelDeliveryBoyPayment(call: any, callback: any): Promise<any>;
    getDeliveryBoyInHandPaymentHistory(call: any, callback: any): Promise<any>
}