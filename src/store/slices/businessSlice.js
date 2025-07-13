import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  businesses: [],
  selectedBusiness: null,
  loading: false,
  error: null,
};

const businessSlice = createSlice({
  name: 'business',
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    
    setBusinesses: (state, action) => {
      state.businesses = action.payload;
      state.loading = false;
      state.error = null;
    },
    
    setSelectedBusiness: (state, action) => {
      state.selectedBusiness = action.payload;
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
export const selectBusinesses = (state) => state.business?.businesses || [];
export const selectSelectedBusiness = (state) => state.business?.selectedBusiness || null;
export const selectBusinessLoading = (state) => state.business?.loading || false;
export const selectBusinessError = (state) => state.business?.error || null;

export const { 
  setLoading, 
  setBusinesses, 
  setSelectedBusiness, 
  setError, 
  clearError 
} = businessSlice.actions;

export default businessSlice.reducer;