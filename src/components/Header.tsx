import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import Auth from './Auth';

const Header: React.FC = () => {
  const { state } = useCart();
  const { user, logout, isAuthenticated } = useAuth();
  const [showAuth, setShowAuth] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  
  const itemCount = state.items.reduce((total, item) => total + item.quantity, 0);

  const handleProfileClick = () => {
    if (isAuthenticated) {
      setShowProfileMenu(!showProfileMenu);
    } else {
      setShowAuth(true);
    }
  };

  const handleLogout = () => {
    logout();
    setShowProfileMenu(false);
  };

  return (
    <>
      <header className="header">
        <div className="header-content">
          <Link to="/" className="logo">
            <h1>ShopSphere</h1>
          </Link>
          <nav className="nav">
            <Link to="/" className="nav-link">Products</Link>
            <Link to="/orders" className="nav-link">Orders</Link>
            <Link to="/cart" className="nav-link cart-link">
              Cart ({itemCount})
            </Link>
            <div className="profile-container">
              <button className="profile-btn" onClick={handleProfileClick}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z" fill="currentColor"/>
                </svg>
                {isAuthenticated && <span className="profile-name">{user?.name}</span>}
              </button>
              
              {showProfileMenu && isAuthenticated && (
                <div className="profile-menu">
                  <div className="profile-info">
                    <p><strong>{user?.name}</strong></p>
                    <p>{user?.email}</p>
                  </div>
                  <button className="logout-btn" onClick={handleLogout}>
                    Logout
                  </button>
                </div>
              )}
            </div>
          </nav>
        </div>
      </header>
      
      {showAuth && (
        <Auth onClose={() => setShowAuth(false)} />
      )}
    </>
  );
};

export default Header;