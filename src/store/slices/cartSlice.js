import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  items: [],
  restaurant: null,
  subtotal: 0,
  deliveryFee: 0,
  tax: 0,
  total: 0,
  specialInstructions: '',
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const { product, restaurant, quantity = 1, selectedOptions = [] } = action.payload;
      
      if (state.items.length === 0) {
        state.restaurant = restaurant;
      }
      
      if (state.restaurant && state.restaurant.id !== restaurant.id) {
        state.items = [];
        state.restaurant = restaurant;
      }
      
      const itemId = `${product.id}-${JSON.stringify(selectedOptions)}`;
      const existingItemIndex = state.items.findIndex(item => item.itemId === itemId);
      
      if (existingItemIndex >= 0) {
        state.items[existingItemIndex].quantity += quantity;
      } else {
        const newItem = {
          itemId,
          product,
          quantity,
          selectedOptions,
          unitPrice: product.price,
          totalPrice: product.price * quantity,
        };
        state.items.push(newItem);
      }
      
      cartSlice.caseReducers.calculateTotals(state);
    },
    
    removeFromCart: (state, action) => {
      const { itemId } = action.payload;
      state.items = state.items.filter(item => item.itemId !== itemId);
      
      if (state.items.length === 0) {
        state.restaurant = null;
      }
      
      cartSlice.caseReducers.calculateTotals(state);
    },
    
    updateQuantity: (state, action) => {
      const { itemId, quantity } = action.payload;
      const itemIndex = state.items.findIndex(item => item.itemId === itemId);
      
      if (itemIndex >= 0) {
        if (quantity <= 0) {
          state.items.splice(itemIndex, 1);
        } else {
          state.items[itemIndex].quantity = quantity;
          state.items[itemIndex].totalPrice = state.items[itemIndex].unitPrice * quantity;
        }
      }
      
      if (state.items.length === 0) {
        state.restaurant = null;
      }
      
      cartSlice.caseReducers.calculateTotals(state);
    },
    
    clearCart: (state) => {
      return { ...initialState };
    },
    
    setSpecialInstructions: (state, action) => {
      state.specialInstructions = action.payload;
    },
    
    calculateTotals: (state) => {
      state.subtotal = state.items.reduce((total, item) => total + item.totalPrice, 0);
      state.deliveryFee = state.restaurant?.deliveryFee || 0;
      state.tax = state.subtotal * 0.1;
      state.total = state.subtotal + state.deliveryFee + state.tax;
    },
  },
});

export const selectCartItems = (state) => state.cart.items;
export const selectCartRestaurant = (state) => state.cart.restaurant;
export const selectCartSubtotal = (state) => state.cart.subtotal;
export const selectCartDeliveryFee = (state) => state.cart.deliveryFee;
export const selectCartTax = (state) => state.cart.tax;
export const selectCartTotal = (state) => state.cart.total;
export const selectCartItemCount = (state) => state.cart.items.reduce((count, item) => count + item.quantity, 0);
export const selectSpecialInstructions = (state) => state.cart.specialInstructions;

export const {
  addToCart,
  removeFromCart,
  updateQuantity,
  clearCart,
  setSpecialInstructions,
  calculateTotals,
} = cartSlice.actions;

export default cartSlice.reducer;