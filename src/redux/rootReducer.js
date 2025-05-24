const intialState = {
  loading: false,
  cartItems: [],
};

export const rootReducer = (state = intialState, action) => {
  switch (action.type) {
    case "SHOW_LOADING":
      return {
        ...state,
        loading: true,
      };
    case "HIDE_LOADING":
      return {
        ...state,
        loading: false,
      };
    case "ADD_TO_CART":
      const existingItemIndex = state.cartItems.findIndex(
        (item) => item._id === action.payload._id
      );

      if (existingItemIndex >= 0) {
        // Item exists: update quantity and totalPrice
        const updatedCart = [...state.cartItems];
        const existingItem = updatedCart[existingItemIndex];
        const newQuantity = existingItem.quantity + 1;
        updatedCart[existingItemIndex] = {
          ...existingItem,
          quantity: newQuantity,
          totalPrice: newQuantity * existingItem.price,
        };
        return {
          ...state,
          cartItems: updatedCart,
        };
      } else {
        // Item doesn't exist: add to cart with quantity = 1 and totalPrice = price
        return {
          ...state,
          cartItems: [...state.cartItems, { ...action.payload, quantity: 1, totalPrice: action.payload.price }],
        };
      }

    case "UPDATE_CART":
      return {
        ...state,
        cartItems: state.cartItems.map((item) =>
          item._id === action.payload._id
            ? {
              ...item,
              quantity: action.payload.quantity,
              totalPrice: item.price * action.payload.quantity,
            }
            : item
        ),
      };

    case "DELETE_FROM_CART":
      return {
        ...state,
        cartItems: state.cartItems.filter(
          (item) => item._id !== action.payload._id
        ),
      };
    case "CLEAR_CART":
      return {
        ...state,
        cartItems: [],
      };

    default:
      return state;
  }
};
