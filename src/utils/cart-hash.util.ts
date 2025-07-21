import crypto from 'crypto';

export function generateCartHash(cartItems: any[]): string {
    const sortedItems = cartItems
        .map(item => ({
            id: item.id,
            quantity: item.quantity,
            price: item.price,
        }))
        .sort((a, b) => a.id.localeCompare(b.id));

    const stringified = JSON.stringify(sortedItems);
    return crypto.createHash('sha256').update(stringified).digest('hex');
}
