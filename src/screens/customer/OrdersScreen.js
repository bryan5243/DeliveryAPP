import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import {
  selectOrders,
  selectActiveOrders,
  selectOrderHistory,
  selectOrdersLoading,
  fetchUserOrders,
  ORDER_STATUS,
} from '../../store/slices/ordersSlice';
import { selectUser } from '../../store/slices/authSlice';

const OrdersScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();
  
  const user = useSelector(selectUser);
  const orders = useSelector(selectOrders);
  const activeOrders = useSelector(selectActiveOrders);
  const orderHistory = useSelector(selectOrderHistory);
  const isLoading = useSelector(selectOrdersLoading);
  
  const [selectedTab, setSelectedTab] = useState('active');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (user) {
      dispatch(fetchUserOrders(user.id));
    }
  }, [user, dispatch]);

  const onRefresh = async () => {
    setRefreshing(true);
    if (user) {
      await dispatch(fetchUserOrders(user.id));
    }
    setRefreshing(false);
  };

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

  const getStatusText = (status) => {
    switch (status) {
      case ORDER_STATUS.CONFIRMED:
        return 'Confirmado';
      case ORDER_STATUS.PREPARING:
        return 'Preparando';
      case ORDER_STATUS.READY_FOR_PICKUP:
        return 'Listo para recoger';
      case ORDER_STATUS.OUT_FOR_DELIVERY:
        return 'En camino';
      case ORDER_STATUS.DELIVERED:
        return 'Entregado';
      case ORDER_STATUS.CANCELLED:
        return 'Cancelado';
      default:
        return 'Desconocido';
    }
  };

  const renderOrderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.orderCard}
      onPress={() => navigation.navigate('OrderTracking', { orderId: item.id })}
    >
      <View style={styles.orderHeader}>
        <View style={styles.restaurantInfo}>
          <Text style={styles.restaurantEmoji}>{item.restaurant.image}</Text>
          <View style={styles.restaurantDetails}>
            <Text style={styles.restaurantName}>{item.restaurant.name}</Text>
            <Text style={styles.orderDate}>
              {new Date(item.createdAt).toLocaleDateString()} • {new Date(item.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
            </Text>
          </View>
        </View>
        
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
        </View>
      </View>
      
      <View style={styles.orderDetails}>
        <Text style={styles.itemsCount}>
          {item.items.length} producto{item.items.length !== 1 ? 's' : ''}
        </Text>
        <Text style={styles.orderTotal}>${item.total.toFixed(2)}</Text>
      </View>
      
      <View style={styles.orderFooter}>
        <Text style={styles.orderNumber}>#{item.id.slice(-8)}</Text>
        <Text style={styles.viewDetails}>Ver detalles ›</Text>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => {
    const isActiveTab = selectedTab === 'active';
    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyEmoji}>
          {isActiveTab ? '📦' : '📋'}
        </Text>
        <Text style={styles.emptyTitle}>
          {isActiveTab ? 'No tienes pedidos activos' : 'No hay historial de pedidos'}
        </Text>
        <Text style={styles.emptySubtitle}>
          {isActiveTab 
            ? 'Cuando hagas un pedido, aparecerá aquí'
            : 'Tus pedidos completados aparecerán aquí'
          }
        </Text>
        {isActiveTab && (
          <TouchableOpacity
            style={styles.browseButton}
            onPress={() => navigation.navigate('Home')}
          >
            <Text style={styles.browseButtonText}>Explorar restaurantes</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const currentData = selectedTab === 'active' ? activeOrders : orderHistory;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mis Pedidos</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'active' && styles.activeTab]}
          onPress={() => setSelectedTab('active')}
        >
          <Text style={[styles.tabText, selectedTab === 'active' && styles.activeTabText]}>
            Activos ({activeOrders.length})
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'history' && styles.activeTab]}
          onPress={() => setSelectedTab('history')}
        >
          <Text style={[styles.tabText, selectedTab === 'history' && styles.activeTabText]}>
            Historial ({orderHistory.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Orders List */}
      <FlatList
        data={currentData}
        renderItem={renderOrderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.listContainer,
          { paddingBottom: insets.bottom + 80 }
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#3498DB']}
            tintColor="#3498DB"
          />
        }
        ListEmptyComponent={renderEmptyState}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ECF0F1',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
    textAlign: 'center',
  },
  // Tabs
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#F8F9FA',
    margin: 20,
    borderRadius: 15,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 12,
  },
  activeTab: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#7F8C8D',
  },
  activeTabText: {
    color: '#3498DB',
  },
  // List
  listContainer: {
    paddingHorizontal: 20,
    flexGrow: 1,
  },
  // Order card
  orderCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  restaurantInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  restaurantEmoji: {
    fontSize: 30,
    marginRight: 12,
  },
  restaurantDetails: {
    flex: 1,
  },
  restaurantName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  orderDate: {
    fontSize: 12,
    color: '#7F8C8D',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 10,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  orderDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  itemsCount: {
    fontSize: 14,
    color: '#7F8C8D',
  },
  orderTotal: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2ECC71',
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#ECF0F1',
    paddingTop: 10,
  },
  orderNumber: {
    fontSize: 12,
    color: '#BDC3C7',
    fontWeight: '500',
  },
  viewDetails: {
    fontSize: 14,
    color: '#3498DB',
    fontWeight: '600',
  },
  // Empty state
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 60,
  },
  emptyEmoji: {
    fontSize: 60,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
    textAlign: 'center',
    marginBottom: 10,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#7F8C8D',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },
  browseButton: {
    backgroundColor: '#3498DB',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
  },
  browseButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default OrdersScreen;