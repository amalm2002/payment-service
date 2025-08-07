
export interface IOrderPaymentController {
    placeOrder(call: any, callback: any): Promise<void>
    createOrderPayment(call: any, callback: any): Promise<void>
    verifyUpiPayment(call: any, callback: any): Promise<void>
    handleFailedPayment(call: any, callback: any): Promise<void>
}