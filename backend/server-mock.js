const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 5003; // Use different port to avoid conflicts

app.use(cors());
app.use(express.json());

// Mock data
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
  },
  {
    _id: '6',
    name: 'Water Bottle',
    price: 24.99,
    offerPrice: 19.99,
    discountPercent: 20,
    description: 'Insulated water bottle keeps drinks cold for 24 hours and hot for 12 hours. BPA-free stainless steel construction with leak-proof lid.',
    image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=300',
    category: 'Sports',
    stock: 20
  },
  {
    _id: '7',
    name: 'Desk Lamp',
    price: 34.99,
    offerPrice: 27.99,
    discountPercent: 20,
    description: 'LED desk lamp with adjustable brightness and color temperature. Touch control, USB charging port, and eye-caring technology.',
    image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=300',
    category: 'Home',
    stock: 14
  },
  {
    _id: '8',
    name: 'Bluetooth Speaker',
    price: 59.99,
    offerPrice: 47.99,
    discountPercent: 20,
    description: 'Portable Bluetooth speaker with premium sound quality. 360-degree sound, waterproof design, and 12-hour battery life.',
    image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=300',
    category: 'Electronics',
    stock: 18
  }
];

let mockOrders = [];
let mockUsers = [];

// API endpoints
app.get('/api/products', (req, res) => {
  res.json(mockProducts);
});

app.get('/api/products/:id', (req, res) => {
  const product = mockProducts.find(p => p._id === req.params.id);
  if (!product) {
    return res.status(404).json({ message: 'Product not found' });
  }
  res.json(product);
});

app.post('/api/orders', (req, res) => {
  const { items, address, total } = req.body;
  
  const orderNumber = 'ORD-' + Date.now();
  
  const order = {
    _id: Date.now().toString(),
    orderNumber,
    items,
    shippingAddress: address,
    totalAmount: total,
    orderDate: new Date(),
    status: 'confirmed'
  };
  
  mockOrders.push(order);
  
  res.status(201).json({ 
    message: 'Order placed successfully', 
    order 
  });
});

app.get('/api/orders', (req, res) => {
  res.json(mockOrders.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate)));
});

app.get('/api/orders/:id', (req, res) => {
  const order = mockOrders.find(o => o._id === req.params.id);
  if (!order) {
    return res.status(404).json({ message: 'Order not found' });
  }
  res.json(order);
});

// Auth endpoints with proper validation
app.post('/api/auth/signup', (req, res) => {
  const { name, email, password } = req.body;
  
  // Validation
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }
  
  if (password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters long' });
  }
  
  // Check if user already exists
  const existingUser = mockUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (existingUser) {
    return res.status(400).json({ message: 'User with this email already exists' });
  }
  
  // Create new user
  const newUser = { 
    _id: Date.now().toString(), 
    name: name.trim(), 
    email: email.toLowerCase().trim(), 
    password // In real app, this would be hashed
  };
  mockUsers.push(newUser);
  
  console.log(`New user registered: ${newUser.name} (${newUser.email})`);
  
  res.status(201).json({ 
    message: 'User registered successfully',
    user: { _id: newUser._id, name: newUser.name, email: newUser.email },
    token: 'mock-token-' + Date.now()
  });
});


app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  // Validation
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }
  
  // Find user in mock storage
  const user = mockUsers.find(u => u.email.toLowerCase() === email.toLowerCase().trim());
  
  if (!user) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }
  
  // Check password (in real app, this would be hashed comparison)
  if (user.password !== password) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }
  
  console.log(`User logged in: ${user.name} (${user.email})`);
  
  res.json({ 
    message: 'Login successful',
    user: { _id: user._id, name: user.name, email: user.email },
    token: 'mock-token-' + Date.now()
  });
});

// Debug endpoint to see registered users (remove in production)
app.get('/api/debug/users', (req, res) => {
  res.json({
    userCount: mockUsers.length,
    users: mockUsers.map(u => ({ id: u._id, name: u.name, email: u.email }))
  });
});

app.listen(PORT, () => {
  console.log(`Mock server is running on port ${PORT}`);
  console.log('Available endpoints:');
  console.log('  POST /api/auth/signup - User registration');
  console.log('  POST /api/auth/login - User login');
  console.log('  GET /api/debug/users - View registered users');
});