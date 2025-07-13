import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
// Comentamos temporalmente hasta crear el servicio
// import { authService } from '../../services/auth/authService';

// Tipos de usuarios
export const USER_ROLES = {
  ADMIN: 'admin',
  BUSINESS: 'business',
  OWNER: 'owner',
  CUSTOMER: 'customer',
  DELIVERY: 'delivery'
};

// Estado inicial
const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  role: null
};

// Thunks asíncronos - con mock integrado
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      // Simulamos delay de red
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock de usuarios para testing integrado
      const mockUsers = {
        'admin@delivery.com': {
          id: '1',
          email: 'admin@delivery.com',
          name: 'Administrador',
          role: 'admin'
        },
        'business@test.com': {
          id: '2',
          email: 'business@test.com',
          name: 'Negocio Test',
          role: 'business'
        },
        'customer@test.com': {
          id: '3',
          email: 'customer@test.com',
          name: 'Cliente Test',
          role: 'customer'
        },
        'delivery@test.com': {
          id: '4',
          email: 'delivery@test.com',
          name: 'Delivery Test',
          role: 'delivery'
        },
        'owner@test.com': {
          id: '5',
          email: 'owner@test.com',
          name: 'Dueño Test',
          role: 'owner'
        }
      };

      const user = mockUsers[email];
      
      if (!user || password !== '123456') {
        throw new Error('Credenciales inválidas');
      }
      
      // Guardar en AsyncStorage
      const token = `mock-token-${user.id}-${Date.now()}`;
      await AsyncStorage.setItem('token', token);
      await AsyncStorage.setItem('user', JSON.stringify(user));
      
      return {
        user,
        token
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const registerUser = createAsyncThunk(
  'auth/registerUser',
  async (userData, { rejectWithValue }) => {
    try {
      // Simulamos delay de red
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock de registro exitoso
      const user = {
        id: `mock-${Date.now()}`,
        email: userData.email,
        name: userData.name,
        phone: userData.phone || '',
        role: 'customer' // Por defecto los registros son clientes
      };
      
      // Guardar en AsyncStorage
      const token = `mock-token-${user.id}`;
      await AsyncStorage.setItem('token', token);
      await AsyncStorage.setItem('user', JSON.stringify(user));
      
      return {
        user,
        token
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const loadStoredAuth = createAsyncThunk(
  'auth/loadStoredAuth',
  async (_, { rejectWithValue }) => {
    try {
      const token = await AsyncStorage.getItem('token');
      const userData = await AsyncStorage.getItem('user');
      
      if (token && userData) {
        // Verificar que el token sea válido (mock)
        if (token.startsWith('mock-token')) {
          return {
            token,
            user: JSON.parse(userData)
          };
        } else {
          // Token inválido, limpiar storage
          await AsyncStorage.multiRemove(['token', 'user']);
          throw new Error('Token inválido');
        }
      }
      
      throw new Error('No hay datos de autenticación almacenados');
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logoutUser',
  async (_, { rejectWithValue }) => {
    try {
      await AsyncStorage.multiRemove(['token', 'user']);
      return null;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    updateUser: (state, action) => {
      state.user = { ...state.user, ...action.payload };
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.role = action.payload.user.role;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Register
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.role = action.payload.user.role;
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Load stored auth
      .addCase(loadStoredAuth.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(loadStoredAuth.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.role = action.payload.user.role;
      })
      .addCase(loadStoredAuth.rejected, (state) => {
        state.isLoading = false;
        state.isAuthenticated = false;
      })
      
      // Logout
      .addCase(logoutUser.fulfilled, (state) => {
        return { ...initialState, isLoading: false };
      });
  }
});

// Selectores
export const selectAuth = (state) => state.auth;
export const selectUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectUserRole = (state) => state.auth.role;
export const selectIsLoading = (state) => state.auth.isLoading;
export const selectAuthError = (state) => state.auth.error;

// Selectores de roles
export const selectIsAdmin = (state) => state.auth.role === USER_ROLES.ADMIN;
export const selectIsBusiness = (state) => state.auth.role === USER_ROLES.BUSINESS;
export const selectIsOwner = (state) => state.auth.role === USER_ROLES.OWNER;
export const selectIsCustomer = (state) => state.auth.role === USER_ROLES.CUSTOMER;
export const selectIsDelivery = (state) => state.auth.role === USER_ROLES.DELIVERY;

export const { clearError, updateUser, setLoading } = authSlice.actions;
export default authSlice.reducer;