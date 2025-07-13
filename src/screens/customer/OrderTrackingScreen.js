import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import {
  selectCurrentOrder,
  selectOrders,
  ORDER_STATUS,
  simulateOrderProgress,
} from '../../store/slices/ordersSlice';

const OrderTrackingScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();
  
  const { orderId } = route.params;
  const currentOrder = useSelector(selectCurrentOrder);
  const orders = useSelector(selectOrders);
  const [simulationInterval, setSimulationInterval] = useState(null);
  
  // Encontrar la orden actual
  const order = currentOrder?.id === orderId ? currentOrder : orders.find(o => o.id === orderId);

  useEffect(() => {
    // Simular progreso automático del pedido para demo
    if (order && order.status !== ORDER_STATUS.DELIVERED && order.status !== ORDER_STATUS.CANCELLED) {
      const interval = setInterval(() => {
        dispatch(simulateOrderProgress({ orderId }));
      }, 10000); // Cada 10 segundos

      setSimulationInterval(interval);

      return () => {
        if (interval) clearInterval(interval);
      };
    }
  }, [order?.status, orderId, dispatch]);

  const getStatusColor = (status) => {
    switch (status) {
      case ORDER_STATUS.CONFIRMED:
        return '#3498DB';
      case ORDER_STATUS.PREPARING:
        return '#F39C12';
      case ORDER_STATUS.READY_FOR_PICKUP:
        return '#9B59B6';
      case ORDER_STATUS.OUT_FOR_DELIVERY:
        return '#E67E22';
      case ORDER_STATUS.DELIVERED:
        return '#2ECC71';
      case ORDER_STATUS.CANCELLED:
        return '#E74C3C';
      default:
        return '#BDC3C7';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case ORDER_STATUS.CONFIRMED:
        return '✅';
      case ORDER_STATUS.PREPARING:
        return '👨‍🍳';
      case ORDER_STATUS.READY_FOR_PICKUP:
        return '📦';
      case ORDER_STATUS.OUT_FOR_DELIVERY:
        return '🚗';
      case ORDER_STATUS.DELIVERED:
        return '🎉';
      case ORDER_STATUS.CANCELLED:
        return '❌';
      default:
        return '⏳';
    }
  };

  const getEstimatedTime = () => {
    if (!order) return '';
    
    const now = new Date();
    const estimated = new Date(order.estimatedDeliveryTime);
    const diffMinutes = Math.max(0, Math.floor((estimated - now) / (1000 * 60)));
    
    if (order.status === ORDER_STATUS.DELIVERED) {
      return 'Entregado';
    }
    
    if (diffMinutes === 0) {
      return 'Llegando pronto';
    }
    
    return `${diffMinutes} min aprox.`;
  };

  const handleCancelOrder = () => {
    Alert.alert(
      'Cancelar pedido',
      '¿Estás seguro de que quieres cancelar este pedido?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Sí, cancelar',
          style: 'destructive',
          onPress: () => {
            // Aquí iría la lógica para cancelar el pedido
            Alert.alert('Pedido cancelado', 'Tu pedido ha sido cancelado exitosamente');
            navigation.goBack();
          }
        }
      ]
    );
  };

  const handleContactSupport = () => {
    Alert.alert(
      'Soporte',
      'Funcionalidad de soporte en desarrollo',
      [{ text: 'OK' }]
    );
  };

  const renderTrackingStep = (step, index, isLast) => {
    const isActive = order.status === step.status;
    const isCompleted = order.trackingSteps.some(s => s.status === step.status);
    
    return (
      <View key={step.status} style={styles.trackingStep}>
        <View style={styles.stepIndicator}>
          <View style={[
            styles.stepDot,
            {
              backgroundColor: isCompleted ? getStatusColor(step.status) : '#ECF0F1',
              borderColor: isActive ? getStatusColor(step.status) : '#ECF0F1',
              borderWidth: isActive ? 3 : 1,
            }
          ]}>
            {isCompleted && (
              <Text style={styles.stepIcon}>{getStatusIcon(step.status)}</Text>
            )}
          </View>
          {!isLast && (
            <View style={[
              styles.stepLine,
              { backgroundColor: isCompleted ? getStatusColor(step.status) : '#ECF0F1' }
            ]} />
          )}
        </View>
        
        <View style={styles.stepContent}>
          <Text style={[
            styles.stepTitle,
            { color: isCompleted ? '#2C3E50' : '#BDC3C7' }
          ]}>
            {step.description}
          </Text>
          {isCompleted && order.trackingSteps.find(s => s.status === step.status) && (
            <Text style={styles.stepTime}>
              {new Date(order.trackingSteps.find(s => s.status === step.status).timestamp).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </Text>
          )}
        </View>
      </View>
    );
  };

  if (!order) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Seguimiento</Text>
          <View style={styles.placeholder} />
        </View>
        
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3498DB" />
          <Text style={styles.loadingText}>Cargando información del pedido...</Text>
        </View>
      </View>
    );
  }

  const allSteps = [
    { status: ORDER_STATUS.CONFIRMED, description: 'Pedido confirmado' },
    { status: ORDER_STATUS.PREPARING, description: 'Preparando tu pedido' },
    { status: ORDER_STATUS.READY_FOR_PICKUP, description: 'Listo para recoger' },
    { status: ORDER_STATUS.OUT_FOR_DELIVERY, description: 'En camino' },
    { status: ORDER_STATUS.DELIVERED, description: 'Entregado' },
  ];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Seguimiento</Text>
        <TouchableOpacity
          style={styles.supportButton}
          onPress={handleContactSupport}
        >
          <Text style={styles.supportIcon}>💬</Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.content}
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Order Status Card */}
        <View style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <Text style={styles.statusIcon}>{getStatusIcon(order.status)}</Text>
            <View style={styles.statusInfo}>
              <Text style={styles.statusTitle}>
                {allSteps.find(s => s.status === order.status)?.description || 'Estado desconocido'}
              </Text>
              <Text style={styles.statusSubtitle}>
                Tiempo estimado: {getEstimatedTime()}
              </Text>
            </View>
          </View>
          
          <View style={styles.orderInfo}>
            <Text style={styles.orderNumber}>Pedido #{order.id.slice(-8)}</Text>
            <Text style={styles.orderTime}>
              {new Date(order.createdAt).toLocaleString()}
            </Text>
          </View>
        </View>

        {/* Restaurant Info */}
        <View style={styles.restaurantCard}>
          <Text style={styles.restaurantEmoji}>{order.restaurant.image}</Text>
          <View style={styles.restaurantInfo}>
            <Text style={styles.restaurantName}>{order.restaurant.name}</Text>
            <Text style={styles.restaurantAddress}>Preparando tu pedido</Text>
          </View>
        </View>

        {/* Tracking Steps */}
        <View style={styles.trackingContainer}>
          <Text style={styles.sectionTitle}>Estado del pedido</Text>
          
          <View style={styles.trackingSteps}>
            {allSteps.map((step, index) => 
              renderTrackingStep(step, index, index === allSteps.length - 1)
            )}
          </View>
        </View>

        {/* Order Items */}
        <View style={styles.itemsContainer}>
          <Text style={styles.sectionTitle}>Productos ({order.items.length})</Text>
          
          {order.items.map((item, index) => (
            <View key={index} style={styles.orderItem}>
              <Text style={styles.itemEmoji}>{item.product.image}</Text>
              <View style={styles.itemDetails}>
                <Text style={styles.itemName}>{item.product.name}</Text>
                <Text style={styles.itemQuantity}>Cantidad: {item.quantity}</Text>
              </View>
              <Text style={styles.itemPrice}>${item.totalPrice.toFixed(2)}</Text>
            </View>
          ))}
          
          <View style={styles.orderSummary}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>${order.subtotal.toFixed(2)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Entrega</Text>
              <Text style={styles.summaryValue}>${order.deliveryFee.toFixed(2)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Impuestos</Text>
              <Text style={styles.summaryValue}>${order.tax.toFixed(2)}</Text>
            </View>
            <View style={[styles.summaryRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>${order.total.toFixed(2)}</Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        {order.status !== ORDER_STATUS.DELIVERED && order.status !== ORDER_STATUS.CANCELLED && (
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleCancelOrder}
            >
              <Text style={styles.cancelButtonText}>Cancelar pedido</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Delivery completed actions */}
        {order.status === ORDER_STATUS.DELIVERED && (
          <View style={styles.completedActions}>
            <TouchableOpacity style={styles.rateButton}>
              <Text style={styles.rateButtonText}>⭐ Calificar pedido</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.reorderButton}>
              <Text style={styles.reorderButtonText}>🔄 Pedir de nuevo</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ECF0F1',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 18,
    color: '#2C3E50',
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  supportButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#3498DB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  supportIcon: {
    fontSize: 18,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 20,
    fontSize: 16,
    color: '#7F8C8D',
  },
  // Status card
  statusCard: {
    margin: 20,
    backgroundColor: '#F8F9FA',
    borderRadius: 15,
    padding: 20,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  statusIcon: {
    fontSize: 40,
    marginRight: 15,
  },
  statusInfo: {
    flex: 1,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  statusSubtitle: {
    fontSize: 14,
    color: '#7F8C8D',
    marginTop: 5,
  },
  orderInfo: {
    borderTopWidth: 1,
    borderTopColor: '#ECF0F1',
    paddingTop: 15,
  },
  orderNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C3E50',
  },
  orderTime: {
    fontSize: 12,
    color: '#7F8C8D',
    marginTop: 2,
  },
  // Restaurant card
  restaurantCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: '#F8F9FA',
    borderRadius: 15,
    padding: 15,
  },
  restaurantEmoji: {
    fontSize: 30,
    marginRight: 15,
  },
  restaurantInfo: {
    flex: 1,
  },
  restaurantName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  restaurantAddress: {
    fontSize: 14,
    color: '#7F8C8D',
    marginTop: 2,
  },
  // Tracking
  trackingContainer: {
    margin: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 20,
  },
  trackingSteps: {
    paddingLeft: 10,
  },
  trackingStep: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  stepIndicator: {
    alignItems: 'center',
    marginRight: 15,
  },
  stepDot: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  stepIcon: {
    fontSize: 18,
  },
  stepLine: {
    width: 3,
    height: 30,
    marginTop: -10,
  },
  stepContent: {
    flex: 1,
    paddingTop: 8,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  stepTime: {
    fontSize: 12,
    color: '#7F8C8D',
    marginTop: 2,
  },
  // Order items
  itemsContainer: {
    margin: 20,
    backgroundColor: '#F8F9FA',
    borderRadius: 15,
    padding: 20,
  },
  orderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  itemEmoji: {
    fontSize: 24,
    marginRight: 15,
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C3E50',
  },
  itemQuantity: {
    fontSize: 12,
    color: '#7F8C8D',
    marginTop: 2,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2ECC71',
  },
  orderSummary: {
    borderTopWidth: 1,
    borderTopColor: '#ECF0F1',
    paddingTop: 15,
    marginTop: 10,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#7F8C8D',
  },
  summaryValue: {
    fontSize: 14,
    color: '#2C3E50',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#ECF0F1',
    paddingTop: 10,
    marginTop: 10,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2ECC71',
  },
  // Action buttons
  actionButtons: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  cancelButton: {
    backgroundColor: '#E74C3C',
    height: 45,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  // Completed actions
  completedActions: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 20,
  },
  rateButton: {
    flex: 1,
    backgroundColor: '#F39C12',
    height: 45,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  rateButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  reorderButton: {
    flex: 1,
    backgroundColor: '#3498DB',
    height: 45,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  reorderButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default OrderTrackingScreen;