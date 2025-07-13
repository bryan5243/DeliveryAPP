import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Estados del pedido
export const ORDER_STATUS = {
  PENDING_PAYMENT: 'pending_payment',
  CONFIRMED: 'confirmed',
  PREPARING: 'preparing',
  READY_FOR_PICKUP: 'ready_for_pickup',
  OUT_FOR_DELIVERY: 'out_for_delivery',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled'
};

// Métodos de pago
export const PAYMENT_METHODS = {
  CASH: 'cash',
  CARD: 'card',
  DIGITAL_WALLET: 'digital_wallet'
};

const initialState = {
  currentOrder: null,
  orders: [],
  isLoading: false,
  error: null,
  orderInProgress: false,
};

// Thunks asíncronos
export const createOrder = createAsyncThunk(
  'orders/createOrder',
  async (orderData, { rejectWithValue }) => {
    try {
      // Simular llamada a API
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const newOrder = {
        id: `order-${Date.now()}`,
        ...orderData,
        status: ORDER_STATUS.CONFIRMED,
        createdAt: new Date().toISOString(),
        estimatedDeliveryTime: new Date(Date.now() + 45 * 60000).toISOString(), // 45 min
        trackingSteps: [
          {
            status: ORDER_STATUS.CONFIRMED,
            timestamp: new Date().toISOString(),
            description: 'Pedido confirmado'
          }
        ]
      };
      
      return newOrder;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateOrderStatus = createAsyncThunk(
  'orders/updateOrderStatus',
  async ({ orderId, status, description }, { rejectWithValue }) => {
    try {
      // Simular llamada a API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const trackingStep = {
        status,
        timestamp: new Date().toISOString(),
        description: description || getStatusDescription(status)
      };
      
      return { orderId, status, trackingStep };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchUserOrders = createAsyncThunk(
  'orders/fetchUserOrders',
  async (userId, { rejectWithValue }) => {
    try {
      // Simular llamada a API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock orders para demo
      const mockOrders = [
        {
          id: 'order-demo-1',
          restaurant: {
            id: '1',
            name: 'Pizza Palace',
            image: '🍕'
          },
          items: [
            {
              product: { name: 'Pizza Margherita', image: '🍕' },
              quantity: 1,
              unitPrice: 18.99,
              totalPrice: 18.99
            }
          ],
          subtotal: 18.99,
          deliveryFee: 2.50,
          tax: 1.90,
          total: 23.39,
          status: ORDER_STATUS.DELIVERED,
          createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          deliveredAt: new Date(Date.now() - 23 * 60 * 60 * 1000).toISOString(),
        }
      ];
      
      return mockOrders;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Función auxiliar para obtener descripción del estado
const getStatusDescription = (status) => {
  const descriptions = {
    [ORDER_STATUS.CONFIRMED]: 'Pedido confirmado',
    [ORDER_STATUS.PREPARING]: 'Preparando tu pedido',
    [ORDER_STATUS.READY_FOR_PICKUP]: 'Listo para recoger',
    [ORDER_STATUS.OUT_FOR_DELIVERY]: 'En camino',
    [ORDER_STATUS.DELIVERED]: 'Entregado',
    [ORDER_STATUS.CANCELLED]: 'Cancelado'
  };
  return descriptions[status] || 'Estado actualizado';
};

const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    clearCurrentOrder: (state) => {
      state.currentOrder = null;
      state.orderInProgress = false;
    },
    setOrderInProgress: (state, action) => {
      state.orderInProgress = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    // Simular actualización en tiempo real
    simulateOrderProgress: (state, action) => {
      const { orderId } = action.payload;
      const order = state.orders.find(o => o.id === orderId) || state.currentOrder;
      
      if (order && order.id === orderId) {
        const statusFlow = [
          ORDER_STATUS.CONFIRMED,
          ORDER_STATUS.PREPARING,
          ORDER_STATUS.READY_FOR_PICKUP,
          ORDER_STATUS.OUT_FOR_DELIVERY,
          ORDER_STATUS.DELIVERED
        ];
        
        const currentIndex = statusFlow.indexOf(order.status);
        if (currentIndex < statusFlow.length - 1) {
          const nextStatus = statusFlow[currentIndex + 1];
          order.status = nextStatus;
          order.trackingSteps.push({
            status: nextStatus,
            timestamp: new Date().toISOString(),
            description: getStatusDescription(nextStatus)
          });
        }
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // Create order
      .addCase(createOrder.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.orderInProgress = true;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentOrder = action.payload;
        state.orders.unshift(action.payload);
        state.orderInProgress = false;
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.orderInProgress = false;
      })
      
      // Update order status
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        const { orderId, status, trackingStep } = action.payload;
        
        // Actualizar en currentOrder
        if (state.currentOrder && state.currentOrder.id === orderId) {
          state.currentOrder.status = status;
          state.currentOrder.trackingSteps.push(trackingStep);
        }
        
        // Actualizar en orders array
        const orderIndex = state.orders.findIndex(o => o.id === orderId);
        if (orderIndex !== -1) {
          state.orders[orderIndex].status = status;
          state.orders[orderIndex].trackingSteps.push(trackingStep);
        }
      })
      
      // Fetch user orders
      .addCase(fetchUserOrders.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchUserOrders.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orders = action.payload;
      })
      .addCase(fetchUserOrders.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  }
});

// Selectores
export const selectCurrentOrder = (state) => state.orders.currentOrder;
export const selectOrders = (state) => state.orders.orders;
export const selectOrdersLoading = (state) => state.orders.isLoading;
export const selectOrdersError = (state) => state.orders.error;
export const selectOrderInProgress = (state) => state.orders.orderInProgress;

// Selectores específicos
export const selectActiveOrders = (state) => 
  state.orders.orders.filter(order => 
    ![ORDER_STATUS.DELIVERED, ORDER_STATUS.CANCELLED].includes(order.status)
  );

export const selectOrderHistory = (state) => 
  state.orders.orders.filter(order => 
    [ORDER_STATUS.DELIVERED, ORDER_STATUS.CANCELLED].includes(order.status)
  );

export const {
  clearCurrentOrder,
  setOrderInProgress,
  clearError,
  simulateOrderProgress
} = ordersSlice.actions;

export default ordersSlice.reducer;