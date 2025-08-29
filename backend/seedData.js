const mongoose = require('mongoose');
const Product = require('./models/Product');

require('dotenv').config();
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/shopping-website');

// Function to generate random discount between 10-30%
const getRandomDiscount = () => {
  return Math.floor(Math.random() * 21) + 10; // Random number between 10-30
};

// Function to calculate offer price based on discount percentage
const calculateOfferPrice = (originalPrice, discountPercent) => {
  return parseFloat((originalPrice * (1 - discountPercent / 100)).toFixed(2));
};

const baseProducts = [
  {
    name: 'Wireless Headphones',
    price: 79.99,
    description: 'High-quality wireless headphones with noise cancellation technology. Features include active noise cancellation, 30-hour battery life, and premium comfort padding.',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300',
    category: 'Electronics',
    stock: 15
  },
  {
    name: 'Coffee Mug',
    price: 12.99,
    description: 'Ceramic coffee mug with heat retention technology. Perfect for your morning coffee or tea. Dishwasher and microwave safe.',
    image: 'https://images.unsplash.com/photo-1605714196241-00bf7a8fe7bb?w=300',
    category: 'Kitchen',
    stock: 25
  },
  {
    name: 'Running Shoes',
    price: 89.99,
    description: 'Comfortable running shoes with superior cushioning and arch support. Breathable mesh upper and durable rubber outsole for maximum performance.',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300',
    category: 'Sports',
    stock: 12
  },
  {
    name: 'Backpack',
    price: 45.99,
    description: 'Durable backpack perfect for travel and daily use. Multiple compartments, padded laptop sleeve, and water-resistant material.',
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=300',
    category: 'Accessories',
    stock: 8
  },
  {
    name: 'Smartphone Case',
    price: 19.99,
    description: 'Protective smartphone case with wireless charging support. Drop-tested protection with crystal clear back and flexible bumper.',
    image: 'https://images.unsplash.com/photo-1556656793-08538906a9f8?w=300',
    category: 'Electronics',
    stock: 30
  },
  {
    name: 'Water Bottle',
    price: 24.99,
    description: 'Insulated water bottle keeps drinks cold for 24 hours and hot for 12 hours. BPA-free stainless steel construction with leak-proof lid.',
    image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=300',
    category: 'Sports',
    stock: 20
  },
  {
    name: 'Desk Lamp',
    price: 34.99,
    description: 'LED desk lamp with adjustable brightness and color temperature. Touch control, USB charging port, and eye-caring technology.',
    image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=300',
    category: 'Home',
    stock: 14
  },
  {
    name: 'Bluetooth Speaker',
    price: 59.99,
    description: 'Portable Bluetooth speaker with premium sound quality. 360-degree sound, waterproof design, and 12-hour battery life.',
    image: 'https://images.unsplash.com/photo-1582978571763-2d039e56f0c3?w=300',
    category: 'Electronics',
    stock: 18
  },
  {
    name: 'Yoga Mat',
    price: 29.99,
    description: 'Non-slip yoga mat perfect for home workouts. Extra thick cushioning, eco-friendly materials, and comes with carrying strap.',
    image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=300',
    category: 'Sports',
    stock: 22
  },
  {
    name: 'Notebook Set',
    price: 16.99,
    description: 'Set of 3 premium notebooks for writing and sketching. Hardcover with elastic closure, lined and dotted pages, and pen holder.',
    image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=300',
    category: 'Stationery',
    stock: 35
  }
];

// Generate products with random discounts
const products = baseProducts.map(product => {
  const discountPercent = getRandomDiscount();
  const offerPrice = calculateOfferPrice(product.price, discountPercent);
  
  return {
    ...product,
    offerPrice,
    discountPercent
  };
});

const seedDatabase = async () => {
  try {
    await Product.deleteMany({});
    await Product.insertMany(products);
    console.log('Database seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();