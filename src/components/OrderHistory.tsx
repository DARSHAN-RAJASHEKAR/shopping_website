import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Order } from '../types';

const OrderHistory: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await axios.get('http://localhost:5003/api/orders');
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#f39c12';
      case 'confirmed': return '#3498db';
      case 'shipped': return '#9b59b6';
      case 'delivered': return '#2ecc71';
      case 'cancelled': return '#e74c3c';
      default: return '#95a5a6';
    }
  };

  if (loading) {
    return <div className="loading">Loading order history...</div>;
  }

  if (orders.length === 0) {
    return (
      <div className="order-history">
        <h2>Order History</h2>
        <p className="no-orders">You haven't placed any orders yet.</p>
      </div>
    );
  }

  return (
    <div className="order-history">
      <h2>Order History</h2>
      <div className="orders-container">
        <div className="orders-list">
          {orders.map(order => (
            <div 
              key={order._id} 
              className={`order-card ${selectedOrder?._id === order._id ? 'selected' : ''}`}
              onClick={() => setSelectedOrder(order)}
            >
              <div className="order-header">
                <h3>{order.orderNumber}</h3>
                <span 
                  className="order-status"
                  style={{ backgroundColor: getStatusColor(order.status) }}
                >
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </span>
              </div>
              <div className="order-info">
                <p className="order-date">{formatDate(order.orderDate)}</p>
                <p className="order-total">${order.totalAmount.toFixed(2)}</p>
                <p className="order-items">{order.items.length} item(s)</p>
              </div>
            </div>
          ))}
        </div>
        
        {selectedOrder && (
          <div className="order-details">
            <h3>Order Details</h3>
            <div className="order-summary">
              <div className="detail-row">
                <strong>Order Number:</strong> {selectedOrder.orderNumber}
              </div>
              <div className="detail-row">
                <strong>Date:</strong> {formatDate(selectedOrder.orderDate)}
              </div>
              <div className="detail-row">
                <strong>Status:</strong> 
                <span 
                  className="status-badge"
                  style={{ backgroundColor: getStatusColor(selectedOrder.status) }}
                >
                  {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                </span>
              </div>
              <div className="detail-row">
                <strong>Total:</strong> ${selectedOrder.totalAmount.toFixed(2)}
              </div>
            </div>

            <div className="order-items-section">
              <h4>Items Ordered</h4>
              {selectedOrder.items.map(item => (
                <div key={item._id} className="order-item">
                  <img 
                    src={item.product.image} 
                    alt={item.product.name}
                    className="order-item-image"
                  />
                  <div className="order-item-info">
                    <h5>{item.product.name}</h5>
                    <p>Quantity: {item.quantity}</p>
                    <p>Price: ${item.price.toFixed(2)} each</p>
                  </div>
                  <div className="order-item-total">
                    ${(item.price * item.quantity).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>

            <div className="shipping-address-section">
              <h4>Shipping Address</h4>
              <div className="address-details">
                <p><strong>{selectedOrder.shippingAddress.fullName}</strong></p>
                <p>{selectedOrder.shippingAddress.street}</p>
                <p>{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} {selectedOrder.shippingAddress.zipCode}</p>
                <p>Phone: {selectedOrder.shippingAddress.phone}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderHistory;