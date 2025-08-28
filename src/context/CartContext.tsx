import React, { createContext, useContext, useReducer, useEffect } from "react";
import type { ReactNode } from "react";
import type { Product, CartItem } from "../types";

interface CartState {
  items: CartItem[];
  total: number;
}

type CartAction =
  | { type: "ADD_TO_CART"; payload: Product }
  | { type: "REMOVE_FROM_CART"; payload: string }
  | { type: "UPDATE_QUANTITY"; payload: { id: string; quantity: number } }
  | { type: "CLEAR_CART" }
  | { type: "LOAD_USER_CART"; payload: { userId?: string } }
  | { type: "LOGOUT_USER" };

const CartContext = createContext<
  | {
      state: CartState;
      dispatch: React.Dispatch<CartAction>;
      setCurrentUser: (userId?: string) => void;
    }
  | undefined
>(undefined);

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case "ADD_TO_CART": {
      const existingItem = state.items.find(
        (item) => item.product._id === action.payload._id
      );

      if (existingItem) {
        const updatedItems = state.items.map((item) =>
          item.product._id === action.payload._id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
        return {
          items: updatedItems,
          total: calculateTotal(updatedItems),
        };
      } else {
        const newItems = [
          ...state.items,
          { product: action.payload, quantity: 1 },
        ];
        return {
          items: newItems,
          total: calculateTotal(newItems),
        };
      }
    }
    case "REMOVE_FROM_CART": {
      const newItems = state.items.filter(
        (item) => item.product._id !== action.payload
      );
      return {
        items: newItems,
        total: calculateTotal(newItems),
      };
    }
    case "UPDATE_QUANTITY": {
      const updatedItems = state.items
        .map((item) =>
          item.product._id === action.payload.id
            ? { ...item, quantity: action.payload.quantity }
            : item
        )
        .filter((item) => item.quantity > 0);
      return {
        items: updatedItems,
        total: calculateTotal(updatedItems),
      };
    }
    case "CLEAR_CART":
      return { items: [], total: 0 };
    case "LOAD_USER_CART": {
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
    case "LOGOUT_USER": {
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
    return total + price * item.quantity;
  }, 0);
};

// localStorage utility functions
const getCartStorageKey = (userId?: string) => {
  return userId ? `shopping-cart-${userId}` : "shopping-cart-guest";
};

const saveCartToStorage = (cartState: CartState, userId?: string) => {
  try {
    const key = getCartStorageKey(userId);
    localStorage.setItem(key, JSON.stringify(cartState));
  } catch (error) {
    // Silently handle cart save errors
  }
};

const loadCartFromStorage = (userId?: string): CartState => {
  try {
    const key = getCartStorageKey(userId);
    const stored = localStorage.getItem(key);

    // Show all cart-related keys in localStorage
    const allKeys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const storageKey = localStorage.key(i);
      if (storageKey && storageKey.startsWith("shopping-cart")) {
        allKeys.push(storageKey);
      }
    }

    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed;
    }
  } catch (error) {
    // Silently handle cart load errors
  }
  return { items: [], total: 0 };
};

const mergeGuestCartWithUserCart = (
  guestCart: CartState,
  userCart: CartState
): CartState => {
  if (guestCart.items.length === 0) {
    return userCart;
  }

  if (userCart.items.length === 0) {
    return guestCart;
  }

  // Merge carts - combine quantities for same products
  const mergedItems = [...userCart.items];

  guestCart.items.forEach((guestItem) => {
    const existingItemIndex = mergedItems.findIndex(
      (item) => item.product._id === guestItem.product._id
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
    total: calculateTotal(mergedItems),
  };
};

export const CartProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  // Initialize cart with guest cart data from localStorage immediately
  const [state, dispatch] = useReducer(
    cartReducer,
    { items: [], total: 0 },
    () => {
      const guestCart = loadCartFromStorage(); // Load guest cart on initialization
      return guestCart;
    }
  );
  const [currentUserId, setCurrentUserId] = React.useState<
    string | undefined
  >();
  const [isInitialized, setIsInitialized] = React.useState(false);

  // Save to localStorage whenever cart state changes
  useEffect(() => {
    saveCartToStorage(state, currentUserId);
  }, [state, currentUserId]);

  const setCurrentUser = (userId?: string) => {
    if (!isInitialized) {
      // First time initialization - load appropriate cart
      if (userId) {
        // User is logged in, load their specific cart
        dispatch({ type: "LOAD_USER_CART", payload: { userId } });
      } else {
        // Guest user, load guest cart
        const guestCart = loadCartFromStorage();
        if (guestCart.items.length > 0) {
          dispatch({ type: "LOAD_USER_CART", payload: { userId: undefined } });
        } else {
        }
      }
      setCurrentUserId(userId);
      setIsInitialized(true);
      return;
    }

    if (userId && userId !== currentUserId) {
      // User logged in - load their cart and merge with current cart
      dispatch({ type: "LOAD_USER_CART", payload: { userId } });
    } else if (!userId && currentUserId) {
      // User logged out - save their cart and clear display

      // SAVE user's current cart to their storage before clearing
      if (state.items.length > 0) {
        saveCartToStorage(state, currentUserId);
      }

      // Clear guest cart storage (not user cart - we want to keep that)
      localStorage.removeItem(getCartStorageKey());

      // Update userId first, then clear cart
      setCurrentUserId(userId);

      // Then dispatch the logout action - this clears the visible cart
      dispatch({ type: "LOGOUT_USER" });

      return; // Exit early to avoid setting userId again
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
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
};
