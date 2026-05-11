import { createContext, useContext, useEffect, useMemo, useReducer } from "react";

const CartContext = createContext(null);
const storageKey = "gwn_cart";

const getProductId = (product) => product._id || product.id;

const cartReducer = (state, action) => {
  switch (action.type) {
    case "ADD_ITEM": {
      const product = action.product;
      const id = getProductId(product);
      const quantity = action.quantity || 1;
      const existing = state.items.find((item) => item._id === id);

      if (existing) {
        return {
          ...state,
          items: state.items.map((item) =>
            item._id === id ? { ...item, quantity: Math.min(item.quantity + quantity, 99) } : item
          )
        };
      }

      return {
        ...state,
        items: [
          ...state.items,
          {
            _id: id,
            name: product.name,
            price: Number(product.price),
            category: product.category,
            image: product.images?.[0] || product.image || "",
            stock: product.stock,
            quantity
          }
        ]
      };
    }
    case "UPDATE_QTY":
      return {
        ...state,
        items: state.items.map((item) =>
          item._id === action.id ? { ...item, quantity: Math.max(1, Number(action.quantity)) } : item
        )
      };
    case "REMOVE_ITEM":
      return {
        ...state,
        items: state.items.filter((item) => item._id !== action.id)
      };
    case "CLEAR":
      return { items: [] };
    default:
      return state;
  }
};

const initializer = () => {
  try {
    return JSON.parse(localStorage.getItem(storageKey)) || { items: [] };
  } catch {
    return { items: [] };
  }
};

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, undefined, initializer);

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(state));
  }, [state]);

  const value = useMemo(() => {
    const itemCount = state.items.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = state.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    return {
      items: state.items,
      itemCount,
      subtotal,
      addItem: (product, quantity = 1) => dispatch({ type: "ADD_ITEM", product, quantity }),
      updateQty: (id, quantity) => dispatch({ type: "UPDATE_QTY", id, quantity }),
      removeItem: (id) => dispatch({ type: "REMOVE_ITEM", id }),
      clearCart: () => dispatch({ type: "CLEAR" })
    };
  }, [state]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
};
