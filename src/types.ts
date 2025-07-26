export interface Product {
  _id: string;
  name: string;
  price: number;
  description: string;
  image: string;
  category: string;
  stock: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Address {
  fullName: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
}

export interface OrderItem {
  product: Product;
  quantity: number;
  price: number;
  _id: string;
}

export interface Order {
  _id: string;
  orderNumber: string;
  items: OrderItem[];
  shippingAddress: Address;
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  orderDate: string;
  createdAt: string;
  updatedAt: string;
}