import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const Header: React.FC = () => {
  const { state } = useCart();
  const itemCount = state.items.reduce((total, item) => total + item.quantity, 0);

  return (
    <header className="header">
      <div className="header-content">
        <Link to="/" className="logo">
          <h1>ShopEasy</h1>
        </Link>
        <nav className="nav">
          <Link to="/" className="nav-link">Products</Link>
          <Link to="/orders" className="nav-link">Orders</Link>
          <Link to="/cart" className="nav-link cart-link">
            Cart ({itemCount})
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;