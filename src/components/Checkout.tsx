import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Address } from '../types';
import AddressForm from './AddressForm';
import { useNavigate } from 'react-router-dom';
import Auth from './Auth';
import axios from 'axios';

const Checkout: React.FC = () => {
  const { state, dispatch } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAuth, setShowAuth] = useState(false);

  const handleAddressSubmit = async (address: Address) => {
    setIsSubmitting(true);
    
    try {
      const orderData = {
        items: state.items,
        address,
        total: state.total
      };

      const response = await axios.post('http://localhost:5003/api/orders', orderData);
      
      dispatch({ type: 'CLEAR_CART' });
      alert(`Order placed successfully! Order Number: ${response.data.order.orderNumber}`);
      navigate('/orders');
    } catch (error) {
      console.error('Error placing order:', error);
      alert('Error placing order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (state.items.length === 0) {
    return (
      <div className="checkout">
        <h2>Checkout</h2>
        <p>Your cart is empty. Please add items before checkout.</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <>
        <div className="checkout">
          <h2>Checkout</h2>
          <div className="login-required">
            <p>Please login to continue with checkout.</p>
            <button 
              className="login-btn" 
              onClick={() => setShowAuth(true)}
            >
              Login / Sign Up
            </button>
          </div>
        </div>
        
        {showAuth && (
          <Auth 
            onClose={() => setShowAuth(false)} 
            onSuccess={() => setShowAuth(false)} 
          />
        )}
      </>
    );
  }

  return (
    <div className="checkout">
      <h2>Checkout</h2>
      <div className="checkout-content">
        <div className="order-summary">
          <h3>Order Summary</h3>
          {state.items.map(item => (
            <div key={item.product._id} className="checkout-item">
              <span>{item.product.name} x {item.quantity}</span>
              <span>${(item.product.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
          <div className="checkout-total">
            <strong>Total: ${state.total.toFixed(2)}</strong>
          </div>
        </div>
        <AddressForm onSubmit={handleAddressSubmit} />
        {isSubmitting && <div className="loading">Placing order...</div>}
      </div>
    </div>
  );
};

export default Checkout;