import React from 'react';
import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';

const Cart: React.FC = () => {
  const { state, dispatch } = useCart();

  const updateQuantity = (id: string, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity } });
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
              <button 
                onClick={() => updateQuantity(item.product._id, item.quantity - 1)}
                className="quantity-btn"
              >
                -
              </button>
              <span className="quantity">{item.quantity}</span>
              <button 
                onClick={() => updateQuantity(item.product._id, item.quantity + 1)}
                className="quantity-btn"
              >
                +
              </button>
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