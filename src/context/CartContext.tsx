import React, { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';
import { Product, CartItem } from '../types';

interface CartState {
  items: CartItem[];
  total: number;
}

type CartAction =
  | { type: 'ADD_TO_CART'; payload: Product }
  | { type: 'REMOVE_FROM_CART'; payload: string }
  | { type: 'UPDATE_QUANTITY'; payload: { id: string; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'LOAD_USER_CART'; payload: { userId?: string } }
  | { type: 'LOGOUT_USER' };

const CartContext = createContext<{
  state: CartState;
  dispatch: React.Dispatch<CartAction>;
  setCurrentUser: (userId?: string) => void;
} | undefined>(undefined);

const cartReducer = (state: CartState, action: CartAction): CartState => {
  console.log('🔄 CART REDUCER:', { 
    action: action.type, 
    currentItems: state.items.length,
    payload: action.type === 'ADD_TO_CART' ? action.payload.name : 
             action.type === 'LOAD_USER_CART' ? `userId: ${action.payload.userId}` :
             action.type === 'UPDATE_QUANTITY' ? `${action.payload.id}: ${action.payload.quantity}` :
             action.type === 'REMOVE_FROM_CART' ? action.payload : 'none'
  });
  
  switch (action.type) {
    case 'ADD_TO_CART': {
      const existingItem = state.items.find(
        item => item.product._id === action.payload._id
      );

      if (existingItem) {
        const updatedItems = state.items.map(item =>
          item.product._id === action.payload._id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
        return {
          items: updatedItems,
          total: calculateTotal(updatedItems)
        };
      } else {
        const newItems = [...state.items, { product: action.payload, quantity: 1 }];
        return {
          items: newItems,
          total: calculateTotal(newItems)
        };
      }
    }
    case 'REMOVE_FROM_CART': {
      const newItems = state.items.filter(
        item => item.product._id !== action.payload
      );
      return {
        items: newItems,
        total: calculateTotal(newItems)
      };
    }
    case 'UPDATE_QUANTITY': {
      const updatedItems = state.items.map(item =>
        item.product._id === action.payload.id
          ? { ...item, quantity: action.payload.quantity }
          : item
      ).filter(item => item.quantity > 0);
      return {
        items: updatedItems,
        total: calculateTotal(updatedItems)
      };
    }
    case 'CLEAR_CART':
      return { items: [], total: 0 };
    case 'LOAD_USER_CART': {
      // Load user's cart and merge with current guest cart
      const guestCart = state;
      const userCart = loadCartFromStorage(action.payload.userId);
      
      if (action.payload.userId) {
        // User logged in - merge guest cart with user cart
        const mergedCart = mergeGuestCartWithUserCart(guestCart, userCart);
        // Clear guest cart from storage
        localStorage.removeItem(getCartStorageKey());
        return mergedCart;
      } else {
        // Loading guest cart
        return userCart;
      }
    }
    case 'LOGOUT_USER': {
      // Clear current cart when user logs out
      return { items: [], total: 0 };
    }
    default:
      return state;
  }
};

const calculateTotal = (items: CartItem[]): number => {
  return items.reduce((total, item) => {
    const price = item.product.offerPrice || item.product.price;
    return total + (price * item.quantity);
  }, 0);
};

// localStorage utility functions
const getCartStorageKey = (userId?: string) => {
  return userId ? `shopping-cart-${userId}` : 'shopping-cart-guest';
};

const saveCartToStorage = (cartState: CartState, userId?: string) => {
  try {
    const key = getCartStorageKey(userId);
    console.log('💾 SAVING CART:', { 
      key, 
      userId, 
      itemCount: cartState.items.length, 
      total: cartState.total,
      items: cartState.items.map(i => ({ name: i.product.name, qty: i.quantity }))
    });
    localStorage.setItem(key, JSON.stringify(cartState));
    
    // Verify save worked
    const saved = localStorage.getItem(key);
    console.log('✅ SAVE VERIFIED:', { key, hasSavedData: !!saved });
  } catch (error) {
    console.error('❌ Failed to save cart to localStorage:', error);
  }
};

const loadCartFromStorage = (userId?: string): CartState => {
  try {
    const key = getCartStorageKey(userId);
    const stored = localStorage.getItem(key);
    console.log('📂 LOADING CART:', { key, hasData: !!stored, userId });
    
    // Show all cart-related keys in localStorage
    const allKeys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const storageKey = localStorage.key(i);
      if (storageKey && storageKey.startsWith('shopping-cart')) {
        allKeys.push(storageKey);
      }
    }
    console.log('🗂️  ALL CART KEYS:', allKeys);
    
    if (stored) {
      const parsed = JSON.parse(stored);
      console.log('✅ LOADED CART DATA:', { 
        itemCount: parsed.items?.length || 0,
        items: parsed.items?.map(i => ({ name: i.product.name, qty: i.quantity })) || []
      });
      return parsed;
    }
  } catch (error) {
    console.error('❌ Failed to load cart from localStorage:', error);
  }
  console.log('📭 Returning empty cart');
  return { items: [], total: 0 };
};

const mergeGuestCartWithUserCart = (guestCart: CartState, userCart: CartState): CartState => {
  if (guestCart.items.length === 0) {
    return userCart;
  }
  
  if (userCart.items.length === 0) {
    return guestCart;
  }
  
  // Merge carts - combine quantities for same products
  const mergedItems = [...userCart.items];
  
  guestCart.items.forEach(guestItem => {
    const existingItemIndex = mergedItems.findIndex(
      item => item.product._id === guestItem.product._id
    );
    
    if (existingItemIndex >= 0) {
      // Product exists in user cart, add quantities
      mergedItems[existingItemIndex].quantity += guestItem.quantity;
    } else {
      // Product doesn't exist in user cart, add it
      mergedItems.push(guestItem);
    }
  });
  
  return {
    items: mergedItems,
    total: calculateTotal(mergedItems)
  };
};

// Clear all cart-related localStorage entries (for debugging only)
const clearAllCartStorage = () => {
  // Get all localStorage keys and remove any that start with 'shopping-cart'
  const keysToRemove: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('shopping-cart')) {
      keysToRemove.push(key);
    }
  }
  keysToRemove.forEach(key => {
    localStorage.removeItem(key);
    console.log('Cleared cart storage:', key);
  });
};

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, { items: [], total: 0 }); // Start with empty cart
  const [currentUserId, setCurrentUserId] = React.useState<string | undefined>();
  const [isLoggingOut, setIsLoggingOut] = React.useState(false);
  const [isInitialized, setIsInitialized] = React.useState(false);

  // Save to localStorage whenever cart state changes (but not during logout)
  useEffect(() => {
    if (!isLoggingOut) {
      console.log('Saving cart to storage:', { 
        itemCount: state.items.length, 
        userId: currentUserId,
        key: getCartStorageKey(currentUserId)
      });
      saveCartToStorage(state, currentUserId);
    } else {
      console.log('Skipping cart save during logout');
    }
  }, [state, currentUserId, isLoggingOut]);

  const setCurrentUser = (userId?: string) => {
    console.log('🔄 setCurrentUser called:', { userId, currentUserId, isInitialized });
    
    if (!isInitialized) {
      // First time initialization - load appropriate cart
      console.log('🚀 INITIALIZING CART for user:', userId);
      if (userId) {
        // User is logged in, load their specific cart
        console.log('👤 Loading user-specific cart');
        const userCart = loadCartFromStorage(userId);
        if (userCart.items.length > 0) {
          console.log('📦 User has saved cart items, loading...');
          dispatch({ type: 'LOAD_USER_CART', payload: { userId } });
        } else {
          console.log('📭 User has no saved cart items');
        }
      } else {
        // Guest user, load guest cart
        console.log('👻 Loading guest cart');
        const guestCart = loadCartFromStorage();
        if (guestCart.items.length > 0) {
          console.log('📦 Guest has saved cart items, loading...');
          dispatch({ type: 'LOAD_USER_CART', payload: { userId: undefined } });
        } else {
          console.log('📭 Guest has no saved cart items');
        }
      }
      setCurrentUserId(userId);
      setIsInitialized(true);
      return;
    }

    if (userId && userId !== currentUserId) {
      // User logged in - load their cart and merge with current cart
      console.log('User logged in, loading cart');
      setIsLoggingOut(false);
      dispatch({ type: 'LOAD_USER_CART', payload: { userId } });
    } else if (!userId && currentUserId) {
      // User logged out - save their cart and clear display
      console.log('🚪 User logging out, preserving cart for future login');
      setIsLoggingOut(true);
      
      // SAVE user's current cart to their storage before clearing
      if (state.items.length > 0) {
        console.log('💾 Saving user cart before logout');
        saveCartToStorage(state, currentUserId);
      }
      
      // Clear guest cart storage (not user cart - we want to keep that)
      localStorage.removeItem(getCartStorageKey());
      
      // Then dispatch the logout action - this clears the visible cart
      dispatch({ type: 'LOGOUT_USER' });
      
      // Reset the flag after a brief delay to allow state update
      setTimeout(() => {
        setIsLoggingOut(false);
        console.log('🔓 Logout process completed - cart preserved for future login');
      }, 100);
    }
    setCurrentUserId(userId);
  };

  return (
    <CartContext.Provider value={{ state, dispatch, setCurrentUser }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};