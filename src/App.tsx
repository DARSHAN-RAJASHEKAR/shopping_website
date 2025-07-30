import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import { CartAuthIntegration } from './components/CartAuthIntegration';
import Header from './components/Header';
import ProductList from './components/ProductList';
import ProductDetail from './components/ProductDetail';
import Cart from './components/Cart';
import Checkout from './components/Checkout';
import OrderHistory from './components/OrderHistory';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <CartAuthIntegration>
          <Router>
            <div className="App">
              <Header />
              <main className="main-content">
                <Routes>
                  <Route path="/" element={<ProductList />} />
                  <Route path="/product/:id" element={<ProductDetail />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/checkout" element={<Checkout />} />
                  <Route path="/orders" element={<OrderHistory />} />
                </Routes>
              </main>
            </div>
          </Router>
        </CartAuthIntegration>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
