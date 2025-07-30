const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  offerPrice: {
    type: Number,
    required: false
  },
  discountPercent: {
    type: Number,
    required: false
  },
  description: {
    type: String,
    required: true
  },
  image: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  stock: {
    type: Number,
    required: true,
    default: 10
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Product', productSchema);