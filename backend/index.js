const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Mock data for immediate testing
const mockProducts = [
  {
    _id: '1',
    name: 'Wireless Headphones',
    price: 79.99,
    offerPrice: 63.99,
    discountPercent: 20,
    description: 'High-quality wireless headphones with noise cancellation technology. Features include active noise cancellation, 30-hour battery life, and premium comfort padding.',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300',
    category: 'Electronics',
    stock: 15
  },
  {
    _id: '2',
    name: 'Coffee Mug',
    price: 12.99,
    offerPrice: 9.99,
    discountPercent: 23,
    description: 'Ceramic coffee mug with heat retention technology. Perfect for your morning coffee or tea. Dishwasher and microwave safe.',
    image: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=300',
    category: 'Kitchen',
    stock: 25
  },
  {
    _id: '3',
    name: 'Running Shoes',
    price: 89.99,
    offerPrice: 71.99,
    discountPercent: 20,
    description: 'Comfortable running shoes with superior cushioning and arch support. Breathable mesh upper and durable rubber outsole for maximum performance.',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300',
    category: 'Sports',
    stock: 12
  },
  {
    _id: '4',
    name: 'Backpack',
    price: 45.99,
    offerPrice: 36.79,
    discountPercent: 20,
    description: 'Durable backpack perfect for travel and daily use. Multiple compartments, padded laptop sleeve, and water-resistant material.',
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=300',
    category: 'Accessories',
    stock: 8
  },
  {
    _id: '5',
    name: 'Smartphone Case',
    price: 19.99,
    offerPrice: 15.99,
    discountPercent: 20,
    description: 'Protective smartphone case with wireless charging support. Drop-tested protection with crystal clear back and flexible bumper.',
    image: 'https://images.unsplash.com/photo-1556656793-08538906a9f8?w=300',
    category: 'Electronics',
    stock: 30
  }
];

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/shopping-website')
.then(() => console.log('MongoDB connected'))
.catch(err => {
  console.log('MongoDB connection failed, using mock data:', err.message);
});

const Product = require('./models/Product');
const Order = require('./models/Order');
const authRoutes = require('./routes/auth');

app.get('/api/products', (req, res) => {
  // Return mock data directly for now
  res.json(mockProducts);
});

app.get('/api/products/:id', (req, res) => {
  // Return mock data directly for now
  const product = mockProducts.find(p => p._id === req.params.id);
  if (!product) {
    return res.status(404).json({ message: 'Product not found' });
  }
  res.json(product);
});

app.post('/api/orders', async (req, res) => {
  try {
    const { items, address, total } = req.body;
    
    const orderNumber = 'ORD-' + Date.now();
    
    const orderItems = items.map(item => ({
      product: item.product._id,
      quantity: item.quantity,
      price: item.product.price
    }));
    
    const order = new Order({
      orderNumber,
      items: orderItems,
      shippingAddress: address,
      totalAmount: total
    });
    
    const savedOrder = await order.save();
    
    res.status(201).json({ 
      message: 'Order placed successfully', 
      order: savedOrder 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/orders', async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('items.product')
      .sort({ orderDate: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/orders/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('items.product');
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Use auth routes
app.use('/api/auth', authRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});