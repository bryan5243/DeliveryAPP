// src/store/slices/locationSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as Location from 'expo-location';

const initialState = {
  currentLocation: null,
  deliveryLocation: null,
  pickupLocation: null,
  isTracking: false,
  permissionGranted: false,
  error: null
};

// Thunks para ubicación
export const requestLocationPermission = createAsyncThunk(
  'location/requestPermission',
  async (_, { rejectWithValue }) => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const getCurrentLocation = createAsyncThunk(
  'location/getCurrentLocation',
  async (_, { rejectWithValue }) => {
    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        timestamp: location.timestamp
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const startLocationTracking = createAsyncThunk(
  'location/startTracking',
  async (callback, { rejectWithValue }) => {
    try {
      const subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 10000, // 10 segundos
          distanceInterval: 10, // 10 metros
        },
        (location) => {
          if (callback) {
            callback({
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
              timestamp: location.timestamp
            });
          }
        }
      );
      return subscription;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const locationSlice = createSlice({
  name: 'location',
  initialState,
  reducers: {
    setCurrentLocation: (state, action) => {
      state.currentLocation = action.payload;
    },
    setDeliveryLocation: (state, action) => {
      state.deliveryLocation = action.payload;
    },
    setPickupLocation: (state, action) => {
      state.pickupLocation = action.payload;
    },
    stopTracking: (state) => {
      state.isTracking = false;
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Request permission
      .addCase(requestLocationPermission.fulfilled, (state, action) => {
        state.permissionGranted = action.payload;
      })
      .addCase(requestLocationPermission.rejected, (state, action) => {
        state.error = action.payload;
      })
      // Get current location
      .addCase(getCurrentLocation.fulfilled, (state, action) => {
        state.currentLocation = action.payload;
      })
      .addCase(getCurrentLocation.rejected, (state, action) => {
        state.error = action.payload;
      })
      // Start tracking
      .addCase(startLocationTracking.fulfilled, (state) => {
        state.isTracking = true;
      })
      .addCase(startLocationTracking.rejected, (state, action) => {
        state.error = action.payload;
      });
  }
});

export const { 
  setCurrentLocation, 
  setDeliveryLocation, 
  setPickupLocation, 
  stopTracking,
  clearError 
} = locationSlice.actions;

export default locationSlice.reducer;