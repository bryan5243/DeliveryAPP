import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  currentLocation: null,
  deliveryAddress: null,
  savedAddresses: [],
  loading: false,
  error: null,
};

const locationSlice = createSlice({
  name: 'location',
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    
    setCurrentLocation: (state, action) => {
      state.currentLocation = action.payload;
      state.loading = false;
      state.error = null;
    },
    
    setDeliveryAddress: (state, action) => {
      state.deliveryAddress = action.payload;
    },
    
    setSavedAddresses: (state, action) => {
      state.savedAddresses = action.payload;
    },
    
    addSavedAddress: (state, action) => {
      state.savedAddresses.push(action.payload);
    },
    
    removeSavedAddress: (state, action) => {
      state.savedAddresses = state.savedAddresses.filter(
        address => address.id !== action.payload
      );
    },
    
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    
    clearError: (state) => {
      state.error = null;
    },
  },
});

// SELECTORES
export const selectCurrentLocation = (state) => state.location?.currentLocation || null;
export const selectDeliveryAddress = (state) => state.location?.deliveryAddress || null;
export const selectSavedAddresses = (state) => state.location?.savedAddresses || [];
export const selectLocationLoading = (state) => state.location?.loading || false;
export const selectLocationError = (state) => state.location?.error || null;

export const { 
  setLoading, 
  setCurrentLocation, 
  setDeliveryAddress, 
  setSavedAddresses, 
  addSavedAddress, 
  removeSavedAddress, 
  setError, 
  clearError 
} = locationSlice.actions;

export default locationSlice.reducer;