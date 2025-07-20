import { Document, Types } from 'mongoose';

export interface IPayment extends Document {
  userId: Types.ObjectId;
  orderId?: Types.ObjectId;
  cartItems: CartItem[];
  subtotal?: number;
  deliveryFee?: number;
  tax?: number;
  total?: number;
  address?: string;
  phoneNumber?: string;
  paymentMethod?: string;
  status: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface CartItem {
  id: string;
  name: string;
  description: string;
  price: number;
  quantity: number;
  restaurantId: string;
  restaurant: string;
  category: string;
  discount: number;
  timing: string;
  rating: number;
  hasVariants: boolean;
  images: string[];
  variants: any[];
}
