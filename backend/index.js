const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/shopping-website')
.then(() => console.log('MongoDB connected'))
.catch(err => {
  console.log('MongoDB connection failed:', err.message);
  process.exit(1);
});

const Product = require('./models/Product');
const Order = require('./models/Order');
const authRoutes = require('./routes/auth');

app.get('/api/products', async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/products/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Validate cart items against stock
app.post('/api/cart/validate', async (req, res) => {
  try {
    const { items } = req.body;
    const validationErrors = [];
    
    for (const item of items) {
      const product = await Product.findById(item.product._id);
      if (!product) {
        validationErrors.push({
          productId: item.product._id,
          message: 'Product not found'
        });
        continue;
      }
      
      if (product.stock < item.quantity) {
        validationErrors.push({
          productId: item.product._id,
          productName: product.name,
          requestedQuantity: item.quantity,
          availableStock: product.stock,
          message: `Only ${product.stock} items available in stock`
        });
      }
    }
    
    res.json({
      valid: validationErrors.length === 0,
      errors: validationErrors
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/orders', async (req, res) => {
  try {
    const { items, address, total } = req.body;
    
    // Validate stock availability before placing order
    const stockValidation = [];
    for (const item of items) {
      const product = await Product.findById(item.product._id);
      if (!product) {
        return res.status(400).json({ 
          message: `Product ${item.product.name} not found` 
        });
      }
      
      if (product.stock < item.quantity) {
        stockValidation.push({
          product: product.name,
          requested: item.quantity,
          available: product.stock
        });
      }
    }
    
    if (stockValidation.length > 0) {
      return res.status(400).json({ 
        message: 'Insufficient stock for some items', 
        stockIssues: stockValidation 
      });
    }
    
    const orderNumber = 'ORD-' + Date.now();
    
    // Deduct stock for each item
    for (const item of items) {
      await Product.findByIdAndUpdate(
        item.product._id,
        { $inc: { stock: -item.quantity } }
      );
    }
    
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