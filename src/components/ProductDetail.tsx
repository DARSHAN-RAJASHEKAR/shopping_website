import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Product } from '../types';
import { useCart } from '../context/CartContext';

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { dispatch } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/products/${id}`);
        if (response.ok) {
          const productData = await response.json();
          setProduct(productData);
        } else {
          console.error('Product not found');
        }
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);

  const handleAddToCart = () => {
    if (product) {
      for (let i = 0; i < quantity; i++) {
        dispatch({ type: 'ADD_TO_CART', payload: product });
      }
    }
  };

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity < 1) {
      setQuantity(1);
    } else if (newQuantity <= (product?.stock || 1)) {
      setQuantity(newQuantity);
    }
  };

  if (loading) {
    return <div className="loading">Loading product details...</div>;
  }

  if (!product) {
    return (
      <div className="product-not-found">
        <h2>Product not found</h2>
        <button onClick={() => navigate('/')} className="continue-shopping">
          Back to Products
        </button>
      </div>
    );
  }

  return (
    <div className="product-detail">
      <button onClick={() => navigate('/')} className="back-btn">
        ← Back to Products
      </button>
      
      <div className="product-detail-content">
        <div className="product-detail-image">
          <img src={product.image} alt={product.name} />
        </div>
        
        <div className="product-detail-info">
          <h1 className="product-detail-name">{product.name}</h1>
          <p className="product-detail-category">{product.category}</p>
          
          <div className="product-detail-price">
            {product.offerPrice ? (
              <div className="price-display">
                <span className="detail-offer-price">${product.offerPrice.toFixed(2)}</span>
                <span className="detail-original-price">${product.price.toFixed(2)}</span>
                {product.discountPercent && (
                  <span className="discount-percentage">
                    {product.discountPercent}% OFF
                  </span>
                )}
              </div>
            ) : (
              <span className="detail-price">${product.price.toFixed(2)}</span>
            )}
          </div>
          
          <div className="product-detail-description">
            <h3>Description</h3>
            <p>{product.description}</p>
          </div>
          
          <div className="product-detail-stock">
            <p className={product.stock > 0 ? 'in-stock' : 'out-of-stock'}>
              {product.stock > 0 ? `${product.stock} items in stock` : 'Out of stock'}
            </p>
          </div>
          
          {product.stock > 0 && (
            <div className="product-detail-actions">
              <div className="quantity-selector-detail">
                <label htmlFor="quantity">Quantity:</label>
                <div className="quantity-controls-detail">
                  <button 
                    onClick={() => handleQuantityChange(quantity - 1)}
                    className="quantity-btn-detail decrement"
                  >
                    -
                  </button>
                  <span className="quantity-display-detail">{quantity}</span>
                  <button 
                    onClick={() => handleQuantityChange(quantity + 1)}
                    disabled={quantity >= product.stock}
                    className="quantity-btn-detail increment"
                  >
                    +
                  </button>
                </div>
              </div>
              
              <button 
                onClick={handleAddToCart}
                className="add-to-cart-detail-btn"
              >
                Add to Cart
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;