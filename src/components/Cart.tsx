import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';

const Cart: React.FC = () => {
  const { state, dispatch } = useCart();
  const [stockErrors, setStockErrors] = useState<{[key: string]: string}>({});

  const updateQuantity = async (id: string, quantity: number) => {
    const item = state.items.find(item => item.product._id === id);
    if (!item) return;
    
    // Check stock availability
    try {
      const response = await fetch(`http://localhost:5000/api/products/${id}`);
      const product = await response.json();
      
      if (quantity > product.stock) {
        setStockErrors(prev => ({
          ...prev,
          [id]: `Only ${product.stock} items available in stock`
        }));
        return;
      }
      
      // Clear any existing stock errors for this product
      setStockErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[id];
        return newErrors;
      });
      
      dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity } });
    } catch (error) {
      // Silently handle stock check errors
    }
  };

  const removeFromCart = (id: string) => {
    dispatch({ type: 'REMOVE_FROM_CART', payload: id });
  };

  if (state.items.length === 0) {
    return (
      <div className="cart">
        <h2>Shopping Cart</h2>
        <p className="empty-cart">Your cart is empty</p>
        <Link to="/" className="continue-shopping">Continue Shopping</Link>
      </div>
    );
  }

  return (
    <div className="cart">
      <h2>Shopping Cart</h2>
      <div className="cart-items">
        {state.items.map(item => (
          <div key={item.product._id} className="cart-item">
            <img src={item.product.image} alt={item.product.name} className="cart-item-image" />
            <div className="cart-item-info">
              <h3>{item.product.name}</h3>
              <p>${item.product.price.toFixed(2)}</p>
            </div>
            <div className="cart-item-controls">
              <div className="quantity-selector">
                <label htmlFor={`quantity-${item.product._id}`}>Quantity:</label>
                <select 
                  id={`quantity-${item.product._id}`}
                  value={item.quantity}
                  onChange={(e) => updateQuantity(item.product._id, parseInt(e.target.value))}
                  className="quantity-dropdown"
                >
                  {[...Array(Math.min(item.product.stock || 10, 10))].map((_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {i + 1}
                    </option>
                  ))}
                </select>
                {stockErrors[item.product._id] && (
                  <p className="stock-error">{stockErrors[item.product._id]}</p>
                )}
                <p className="stock-info">Stock: {item.product.stock}</p>
              </div>
              <button 
                onClick={() => removeFromCart(item.product._id)}
                className="remove-btn"
              >
                Remove
              </button>
            </div>
            <div className="cart-item-total">
              ${(item.product.price * item.quantity).toFixed(2)}
            </div>
          </div>
        ))}
      </div>
      <div className="cart-summary">
        <div className="cart-total">
          <strong>Total: ${state.total.toFixed(2)}</strong>
        </div>
        <Link to="/checkout" className="checkout-btn">
          Proceed to Checkout
        </Link>
      </div>
    </div>
  );
};

export default Cart;