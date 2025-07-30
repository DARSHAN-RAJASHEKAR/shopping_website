import React, { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

interface CartAuthIntegrationProps {
  children: React.ReactNode;
}

export const CartAuthIntegration: React.FC<CartAuthIntegrationProps> = ({ children }) => {
  const { user, isLoading } = useAuth();
  const { setCurrentUser } = useCart();

  useEffect(() => {
    // Only update cart context after auth has finished loading
    if (!isLoading) {
      console.log('Auth loaded, setting current user:', user?._id);
      setCurrentUser(user?._id);
    }
  }, [user, isLoading, setCurrentUser]);

  return <>{children}</>;
};