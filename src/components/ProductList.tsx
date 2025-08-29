import React, { useState, useEffect } from 'react';
import axios from 'axios';
import type { Product } from '../types';
import ProductCard from './ProductCard';

const ProductList: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/products');
      setProducts(response.data);
    } catch (error) {
      // If products fail to load, show empty state
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="product-list">
        <h2>Our Products</h2>
        <div className="products-grid">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="skeleton-card">
              <div className="skeleton-image"></div>
              <div className="skeleton-content">
                <div className="skeleton-title"></div>
                <div className="skeleton-description"></div>
                <div className="skeleton-description" style={{width: '60%'}}></div>
                <div className="skeleton-price"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="product-list">
      <h2>Our Products</h2>
      <div className="products-grid">
        {products.map(product => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
    </div>
  );
};

export default ProductList;