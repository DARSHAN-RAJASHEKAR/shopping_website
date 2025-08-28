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
      setCurrentUser(user?.id);
    }
  }, [user, isLoading, setCurrentUser]);

  return <>{children}</>;
};