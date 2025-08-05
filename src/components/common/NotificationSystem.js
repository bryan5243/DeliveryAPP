import React, { useState, useEffect, useContext, createContext } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  FlatList,
  Dimensions,
  Alert,
  Animated,
  PanResponder,
  Switch,
  ScrollView
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { Audio } from 'expo-av';

const { width, height } = Dimensions.get('window');

// Configurar el comportamiento de las notificaciones
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// Context para manejar notificaciones globalmente
const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications debe usarse dentro de NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [settings, setSettings] = useState({
    pushEnabled: true,
    soundEnabled: true,
    orderUpdates: true,
    promotions: true,
    chat: true,
    delivery: true,
    payment: true
  });
  const [expoPushToken, setExpoPushToken] = useState('');

  // Inicializar notificaciones al cargar
  useEffect(() => {
    initializeNotifications();
    loadSettings();
    loadNotifications();
  }, []);

  const initializeNotifications = async () => {
    // Solicitar permisos
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      Alert.alert(
        'Permisos necesarios',
        'Para recibir notificaciones, necesitas habilitar los permisos en la configuración de tu dispositivo.'
      );
      return;
    }

    // Obtener token de Expo
    const token = (await Notifications.getExpoPushTokenAsync()).data;
    setExpoPushToken(token);

    // Listener para notificaciones recibidas
    const receivedListener = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notificación recibida:', notification);
    });

    // Listener para cuando el usuario toca una notificación
    const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      const notification = response.notification.request.content.data;
      handleNotificationPress(notification);
    });

    return () => {
      Notifications.removeNotificationSubscription(receivedListener);
      Notifications.removeNotificationSubscription(responseListener);
    };
  };

  const loadSettings = async () => {
    try {
      const savedSettings = await AsyncStorage.getItem('notificationSettings');
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }
    } catch (error) {
      console.error('Error cargando configuración:', error);
    }
  };

  const saveSettings = async (newSettings) => {
    try {
      await AsyncStorage.setItem('notificationSettings', JSON.stringify(newSettings));
      setSettings(newSettings);
    } catch (error) {
      console.error('Error guardando configuración:', error);
    }
  };

  const loadNotifications = async () => {
    try {
      const savedNotifications = await AsyncStorage.getItem('notifications');
      if (savedNotifications) {
        setNotifications(JSON.parse(savedNotifications));
      }
    } catch (error) {
      console.error('Error cargando notificaciones:', error);
    }
  };

  const saveNotifications = async (newNotifications) => {
    try {
      await AsyncStorage.setItem('notifications', JSON.stringify(newNotifications));
    } catch (error) {
      console.error('Error guardando notificaciones:', error);
    }
  };

  // Función para agregar notificación
  const addNotification = async (notification) => {
    const newNotification = {
      id: Date.now() + Math.random(),
      timestamp: new Date().toISOString(),
      read: false,
      ...notification
    };

    const updatedNotifications = [newNotification, ...notifications];
    setNotifications(updatedNotifications);
    await saveNotifications(updatedNotifications);

    // Enviar notificación push local si está habilitado
    if (settings.pushEnabled && shouldShowNotification(notification.type)) {
      await scheduleLocalNotification(newNotification);
    }

    // Reproducir sonido si está habilitado
    if (settings.soundEnabled) {
      await playNotificationSound(newNotification.type);
    }

    return newNotification.id;
  };

  const shouldShowNotification = (type) => {
    switch (type) {
      case 'order':
        return settings.orderUpdates;
      case 'promotion':
        return settings.promotions;
      case 'chat':
        return settings.chat;
      case 'delivery':
        return settings.delivery;
      case 'payment':
        return settings.payment;
      default:
        return true;
    }
  };

  const scheduleLocalNotification = async (notification) => {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: notification.title,
          body: notification.message,
          data: notification,
          sound: settings.soundEnabled,
        },
        trigger: null, // Inmediata
      });
    } catch (error) {
      console.error('Error enviando notificación local:', error);
    }
  };

  const playNotificationSound = async (type) => {
    try {
      const { sound } = await Audio.Sound.createAsync(
        getNotificationSound(type),
        { shouldPlay: true, volume: 0.3 }
      );
      
      // Descargar el sonido después de reproducir
      setTimeout(() => {
        sound.unloadAsync();
      }, 2000);
    } catch (error) {
      console.error('Error reproduciendo sonido:', error);
    }
  };

  const getNotificationSound = (type) => {
    // Puedes personalizar los sonidos por tipo
    switch (type) {
      case 'order':
        return require('../../assets/sounds/order-notification.mp3');
      case 'payment':
        return require('../../assets/sounds/payment-notification.mp3');
      case 'chat':
        return require('../../assets/sounds/message-notification.mp3');
      default:
        return require('../../assets/sounds/default-notification.mp3');
    }
  };

  const handleNotificationPress = (notification) => {
    markAsRead(notification.id);
    
    // Aquí puedes navegar a la pantalla correspondiente
    switch (notification.type) {
      case 'order':
        // Navegar a OrderTrackingScreen
        console.log('Navegar a seguimiento de pedido:', notification.orderId);
        break;
      case 'payment':
        // Navegar a pantalla de pagos
        console.log('Navegar a pagos:', notification.paymentId);
        break;
      case 'chat':
        // Abrir chat
        console.log('Abrir chat:', notification.chatId);
        break;
      default:
        break;
    }
  };

  // Función para marcar como leída
  const markAsRead = async (notificationId) => {
    const updatedNotifications = notifications.map(notif => 
      notif.id === notificationId 
        ? { ...notif, read: true }
        : notif
    );
    setNotifications(updatedNotifications);
    await saveNotifications(updatedNotifications);
  };

  // Función para eliminar notificación
  const removeNotification = async (notificationId) => {
    const updatedNotifications = notifications.filter(notif => notif.id !== notificationId);
    setNotifications(updatedNotifications);
    await saveNotifications(updatedNotifications);
  };

  // Función para limpiar todas las notificaciones
  const clearAllNotifications = async () => {
    setNotifications([]);
    await saveNotifications([]);
  };

  // Función para marcar todas como leídas
  const markAllAsRead = async () => {
    const updatedNotifications = notifications.map(notif => ({ ...notif, read: true }));
    setNotifications(updatedNotifications);
    await saveNotifications(updatedNotifications);
  };

  const contextValue = {
    notifications,
    settings,
    addNotification,
    markAsRead,
    removeNotification,
    clearAllNotifications,
    markAllAsRead,
    saveSettings,
    expoPushToken,
    unreadCount: notifications.filter(n => !n.read).length
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
};

// Componente de lista de notificaciones
export const NotificationList = ({ isVisible, onClose }) => {
  const insets = useSafeAreaInsets();
  const { 
    notifications, 
    markAsRead, 
    removeNotification, 
    clearAllNotifications,
    markAllAsRead,
    unreadCount 
  } = useNotifications();

  const slideAnim = new Animated.Value(width);

  useEffect(() => {
    if (isVisible) {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: width,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [isVisible]);

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'order':
        return '🛒';
      case 'payment':
        return '💳';
      case 'delivery':
        return '🚚';
      case 'chat':
        return '💬';
      case 'promotion':
        return '🎁';
      case 'rating':
        return '⭐';
      case 'alert':
        return '⚠️';
      default:
        return 'ℹ️';
    }
  };

  const getBorderColor = (priority) => {
    switch (priority) {
      case 'high':
        return '#E74C3C';
      case 'medium':
        return '#F39C12';
      default:
        return '#BDC3C7';
    }
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now - time) / (1000 * 60));

    if (diffInMinutes < 1) return 'Ahora mismo';
    if (diffInMinutes < 60) return `Hace ${diffInMinutes} min`;
    if (diffInMinutes < 1440) return `Hace ${Math.floor(diffInMinutes / 60)} h`;
    return `Hace ${Math.floor(diffInMinutes / 1440)} días`;
  };

  const renderNotificationItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.notificationItem,
        !item.read && styles.unreadNotification,
        { borderLeftColor: getBorderColor(item.priority) }
      ]}
      onPress={() => {
        markAsRead(item.id);
        // Manejar navegación aquí
      }}
    >
      <View style={styles.notificationContent}>
        <View style={styles.notificationHeader}>
          <Text style={styles.notificationIcon}>{getNotificationIcon(item.type)}</Text>
          <View style={styles.notificationTextContainer}>
            <Text style={[styles.notificationTitle, !item.read && styles.unreadTitle]}>
              {item.title}
            </Text>
            <Text style={styles.notificationMessage} numberOfLines={2}>
              {item.message}
            </Text>
            <Text style={styles.notificationTime}>
              {formatTimeAgo(item.timestamp)}
            </Text>
          </View>
          <View style={styles.notificationActions}>
            {!item.read && <View style={styles.unreadDot} />}
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => removeNotification(item.id)}
            >
              <Text style={styles.deleteButtonText}>✕</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (!isVisible) return null;

  return (
    <Modal
      transparent
      visible={isVisible}
      onRequestClose={onClose}
      animationType="none"
    >
      <View style={styles.modalOverlay}>
        <TouchableOpacity 
          style={styles.modalBackground} 
          onPress={onClose}
          activeOpacity={1}
        />
        <Animated.View 
          style={[
            styles.notificationPanel,
            { 
              paddingTop: insets.top,
              paddingBottom: insets.bottom,
              transform: [{ translateX: slideAnim }]
            }
          ]}
        >
          {/* Header */}
          <View style={styles.panelHeader}>
            <View style={styles.headerLeft}>
              <Text style={styles.headerTitle}>Notificaciones</Text>
              {unreadCount > 0 && (
                <View style={styles.unreadBadge}>
                  <Text style={styles.unreadBadgeText}>{unreadCount}</Text>
                </View>
              )}
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Acciones rápidas */}
          {notifications.length > 0 && (
            <View style={styles.quickActions}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={markAllAsRead}
              >
                <Text style={styles.actionButtonText}>Marcar todas como leídas</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.clearButton]}
                onPress={() => {
                  Alert.alert(
                    'Limpiar notificaciones',
                    '¿Estás seguro de que quieres eliminar todas las notificaciones?',
                    [
                      { text: 'Cancelar', style: 'cancel' },
                      { text: 'Eliminar', onPress: clearAllNotifications }
                    ]
                  );
                }}
              >
                <Text style={[styles.actionButtonText, styles.clearButtonText]}>
                  Limpiar todas
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Lista de notificaciones */}
          <View style={styles.notificationList}>
            {notifications.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyIcon}>🔔</Text>
                <Text style={styles.emptyTitle}>No tienes notificaciones</Text>
                <Text style={styles.emptySubtitle}>
                  Las nuevas notificaciones aparecerán aquí
                </Text>
              </View>
            ) : (
              <FlatList
                data={notifications}
                renderItem={renderNotificationItem}
                keyExtractor={(item) => item.id.toString()}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.listContainer}
              />
            )}
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

// Componente de configuración de notificaciones
export const NotificationSettings = () => {
  const { settings, saveSettings } = useNotifications();

  const handleSettingChange = (key, value) => {
    const newSettings = { ...settings, [key]: value };
    saveSettings(newSettings);
  };

  const SettingItem = ({ title, subtitle, value, onValueChange, icon }) => (
    <View style={styles.settingItem}>
      <View style={styles.settingInfo}>
        <Text style={styles.settingIcon}>{icon}</Text>
        <View style={styles.settingText}>
          <Text style={styles.settingTitle}>{title}</Text>
          <Text style={styles.settingSubtitle}>{subtitle}</Text>
        </View>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: '#BDC3C7', true: '#3498DB' }}
        thumbColor={value ? '#fff' : '#fff'}
      />
    </View>
  );

  return (
    <ScrollView style={styles.settingsContainer}>
      <View style={styles.settingsHeader}>
        <Text style={styles.settingsTitle}>⚙️ Configuración de Notificaciones</Text>
      </View>

      <View style={styles.settingsSection}>
        <SettingItem
          title="Notificaciones Push"
          subtitle="Recibe notificaciones en tiempo real"
          value={settings.pushEnabled}
          onValueChange={(value) => handleSettingChange('pushEnabled', value)}
          icon="📱"
        />

        <SettingItem
          title="Sonido"
          subtitle="Reproducir sonido con las notificaciones"
          value={settings.soundEnabled}
          onValueChange={(value) => handleSettingChange('soundEnabled', value)}
          icon={settings.soundEnabled ? "🔊" : "🔇"}
        />
      </View>

      <View style={styles.settingsSection}>
        <Text style={styles.sectionTitle}>Tipos de Notificaciones</Text>
        
        <SettingItem
          title="Actualizaciones de Pedidos"
          subtitle="Estado de preparación y entrega"
          value={settings.orderUpdates}
          onValueChange={(value) => handleSettingChange('orderUpdates', value)}
          icon="🛒"
        />

        <SettingItem
          title="Promociones y Ofertas"
          subtitle="Descuentos y ofertas especiales"
          value={settings.promotions}
          onValueChange={(value) => handleSettingChange('promotions', value)}
          icon="🎁"
        />

        <SettingItem
          title="Mensajes de Chat"
          subtitle="Comunicación con restaurantes y repartidores"
          value={settings.chat}
          onValueChange={(value) => handleSettingChange('chat', value)}
          icon="💬"
        />

        <SettingItem
          title="Estado de Entrega"
          subtitle="Seguimiento del repartidor"
          value={settings.delivery}
          onValueChange={(value) => handleSettingChange('delivery', value)}
          icon="🚚"
        />

        <SettingItem
          title="Confirmaciones de Pago"
          subtitle="Validación de transferencias bancarias"
          value={settings.payment}
          onValueChange={(value) => handleSettingChange('payment', value)}
          icon="💳"
        />
      </View>
    </ScrollView>
  );
};

// Hook para enviar notificaciones específicas
export const useOrderNotifications = () => {
  const { addNotification } = useNotifications();

  return {
    notifyOrderConfirmed: (orderId) => {
      addNotification({
        type: 'order',
        title: 'Pedido Confirmado ✅',
        message: `Tu pedido #${orderId} ha sido confirmado y está en preparación`,
        orderId,
        priority: 'high'
      });
    },

    notifyOrderReady: (orderId) => {
      addNotification({
        type: 'order',
        title: 'Pedido Listo 🍕',
        message: `Tu pedido #${orderId} está listo y el repartidor está en camino`,
        orderId,
        priority: 'high'
      });
    },

    notifyDeliveryStarted: (orderId, driverName) => {
      addNotification({
        type: 'delivery',
        title: 'Entrega Iniciada 🚚',
        message: `${driverName} está llevando tu pedido #${orderId}`,
        orderId,
        priority: 'medium'
      });
    },

    notifyPaymentApproved: (orderId) => {
      addNotification({
        type: 'payment',
        title: 'Pago Aprobado ✅',
        message: `Tu pago para el pedido #${orderId} ha sido validado exitosamente`,
        orderId,
        priority: 'high'
      });
    },

    notifyPaymentRejected: (orderId, reason) => {
      addNotification({
        type: 'payment',
        title: 'Pago Rechazado ❌',
        message: `Tu comprobante para el pedido #${orderId} fue rechazado. ${reason}`,
        orderId,
        priority: 'high'
      });
    },

    notifyNewMessage: (senderName, message) => {
      addNotification({
        type: 'chat',
        title: `Mensaje de ${senderName}`,
        message: message.length > 50 ? message.substring(0, 50) + '...' : message,
        priority: 'medium'
      });
    },

    notifyPromotion: (title, description) => {
      addNotification({
        type: 'promotion',
        title,
        message: description,
        priority: 'low'
      });
    }
  };
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    flexDirection: 'row',
  },
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  notificationPanel: {
    width: width * 0.85,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: -2, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  panelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ECF0F1',
    backgroundColor: '#3498DB',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  unreadBadge: {
    backgroundColor: '#E74C3C',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 10,
  },
  unreadBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 5,
  },
  closeButtonText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
  },
  quickActions: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: '#F8F9FA',
    borderBottomWidth: 1,
    borderBottomColor: '#ECF0F1',
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#3498DB',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginHorizontal: 5,
  },
  clearButton: {
    backgroundColor: '#95A5A6',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  clearButtonText: {
    color: '#fff',
  },
  notificationList: {
    flex: 1,
  },
  listContainer: {
    paddingBottom: 20,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 60,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 10,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#7F8C8D',
    textAlign: 'center',
  },
  notificationItem: {
    backgroundColor: '#fff',
    marginHorizontal: 15,
    marginVertical: 5,
    borderRadius: 10,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  unreadNotification: {
    backgroundColor: '#EBF3FD',
  },
  notificationContent: {
    padding: 15,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  notificationIcon: {
    fontSize: 20,
    marginRight: 12,
    marginTop: 2,
  },
  notificationTextContainer: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 4,
  },
  unreadTitle: {
    fontWeight: 'bold',
  },
  notificationMessage: {
    fontSize: 14,
    color: '#7F8C8D',
    lineHeight: 20,
    marginBottom: 6,
  },
  notificationTime: {
    fontSize: 12,
    color: '#95A5A6',
  },
  notificationActions: {
    alignItems: 'center',
    marginLeft: 10,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#3498DB',
    marginBottom: 8,
  },
  deleteButton: {
    padding: 5,
  },
  deleteButtonText: {
    fontSize: 16,
    color: '#95A5A6',
  },
  settingsContainer: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  settingsHeader: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ECF0F1',
  },
  settingsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  settingsSection: {
    backgroundColor: '#fff',
    marginTop: 20,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#34495E',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ECF0F1',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ECF0F1',
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    fontSize: 20,
    marginRight: 15,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#7F8C8D',
    marginTop: 2,
  },
});

export default NotificationSystem;