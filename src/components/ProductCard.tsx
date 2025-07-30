import React from 'react';
import { Product } from '../types';
import { Link } from 'react-router-dom';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  return (
    <Link to={`/product/${product._id}`} className="product-card-link">
      <div className="product-card">
        {product.discountPercent && (
          <div className="discount-badge">
            {product.discountPercent}% OFF
          </div>
        )}
        <img src={product.image} alt={product.name} className="product-image" />
        <div className="product-info">
          <h3 className="product-name">{product.name}</h3>
          <p className="product-category">{product.category}</p>
          <div className="product-footer">
            <div className="price-section">
              {product.offerPrice ? (
                <>
                  <span className="offer-price">${product.offerPrice.toFixed(2)}</span>
                  <span className="original-price">${product.price.toFixed(2)}</span>
                </>
              ) : (
                <span className="product-price">${product.price.toFixed(2)}</span>
              )}
            </div>
            {product.stock === 0 && <span className="stock-status">Out of Stock</span>}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;