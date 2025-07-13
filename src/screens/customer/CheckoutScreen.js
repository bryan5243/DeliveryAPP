import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import {
  selectCartItems,
  selectCartRestaurant,
  selectCartTotal,
  selectSpecialInstructions,
  clearCart,
} from '../../store/slices/cartSlice';
import {
  createOrder,
  selectOrdersLoading,
  PAYMENT_METHODS,
} from '../../store/slices/ordersSlice';
import { selectUser } from '../../store/slices/authSlice';

const CheckoutScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();
  
  const user = useSelector(selectUser);
  const cartItems = useSelector(selectCartItems);
  const restaurant = useSelector(selectCartRestaurant);
  const total = useSelector(selectCartTotal);
  const specialInstructions = useSelector(selectSpecialInstructions);
  const isOrderLoading = useSelector(selectOrdersLoading);
  
  const [selectedAddress, setSelectedAddress] = useState('current');
  const [customAddress, setCustomAddress] = useState('');
  const [selectedPayment, setSelectedPayment] = useState(PAYMENT_METHODS.CASH);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [cardDetails, setCardDetails] = useState({
    number: '',
    expiry: '',
    cvv: '',
    name: ''
  });

  // Mock addresses para demo
  const [savedAddresses] = useState([
    {
      id: 'current',
      type: 'Ubicación actual',
      address: 'Tu ubicación actual (GPS)',
      icon: '📍'
    },
    {
      id: 'home',
      type: 'Casa',
      address: 'Av. Principal 123, Ciudad',
      icon: '🏠'
    },
    {
      id: 'work',
      type: 'Trabajo',
      address: 'Calle Comercial 456, Oficina 789',
      icon: '🏢'
    }
  ]);

  const paymentMethods = [
    {
      id: PAYMENT_METHODS.CASH,
      name: 'Efectivo',
      description: 'Pagar al recibir',
      icon: '💵'
    },
    {
      id: PAYMENT_METHODS.CARD,
      name: 'Tarjeta',
      description: 'Débito o crédito',
      icon: '💳'
    },
    {
      id: PAYMENT_METHODS.DIGITAL_WALLET,
      name: 'Billetera Digital',
      description: 'PayPal, Apple Pay, etc.',
      icon: '📱'
    }
  ];

  const getSelectedAddress = () => {
    if (selectedAddress === 'custom') {
      return { type: 'Dirección personalizada', address: customAddress };
    }
    return savedAddresses.find(addr => addr.id === selectedAddress);
  };

  const getSelectedPaymentMethod = () => {
    return paymentMethods.find(method => method.id === selectedPayment);
  };

  const validateOrder = () => {
    if (cartItems.length === 0) {
      Alert.alert('Error', 'Tu carrito está vacío');
      return false;
    }

    const address = getSelectedAddress();
    if (!address || !address.address || address.address.trim() === '') {
      Alert.alert('Error', 'Por favor selecciona una dirección de entrega');
      return false;
    }

    if (selectedPayment === PAYMENT_METHODS.CARD) {
      if (!cardDetails.number || !cardDetails.expiry || !cardDetails.cvv || !cardDetails.name) {
        Alert.alert('Error', 'Por favor completa los datos de la tarjeta');
        return false;
      }
    }

    return true;
  };

  const handlePlaceOrder = async () => {
    if (!validateOrder()) return;

    const orderData = {
      user: user,
      restaurant: restaurant,
      items: cartItems,
      deliveryAddress: getSelectedAddress(),
      paymentMethod: selectedPayment,
      specialInstructions: specialInstructions,
      subtotal: total - (restaurant?.deliveryFee || 0) - (total * 0.1),
      deliveryFee: restaurant?.deliveryFee || 0,
      tax: total * 0.1,
      total: total,
      cardDetails: selectedPayment === PAYMENT_METHODS.CARD ? cardDetails : null,
    };

    try {
      const result = await dispatch(createOrder(orderData)).unwrap();
      
      // Limpiar carrito
      dispatch(clearCart());
      
      // Navegar a tracking
      navigation.replace('OrderTracking', { orderId: result.id });
      
    } catch (error) {
      Alert.alert('Error', 'No se pudo procesar tu pedido. Intenta de nuevo.');
    }
  };

  const renderAddressOption = (address) => (
    <TouchableOpacity
      key={address.id}
      style={[
        styles.optionItem,
        selectedAddress === address.id && styles.optionItemSelected
      ]}
      onPress={() => {
        setSelectedAddress(address.id);
        setShowAddressModal(false);
      }}
    >
      <Text style={styles.optionIcon}>{address.icon}</Text>
      <View style={styles.optionDetails}>
        <Text style={styles.optionTitle}>{address.type}</Text>
        <Text style={styles.optionSubtitle}>{address.address}</Text>
      </View>
      <View style={[
        styles.radioButton,
        selectedAddress === address.id && styles.radioButtonSelected
      ]} />
    </TouchableOpacity>
  );

  const renderPaymentOption = (method) => (
    <TouchableOpacity
      key={method.id}
      style={[
        styles.optionItem,
        selectedPayment === method.id && styles.optionItemSelected
      ]}
      onPress={() => {
        setSelectedPayment(method.id);
        setShowPaymentModal(false);
      }}
    >
      <Text style={styles.optionIcon}>{method.icon}</Text>
      <View style={styles.optionDetails}>
        <Text style={styles.optionTitle}>{method.name}</Text>
        <Text style={styles.optionSubtitle}>{method.description}</Text>
      </View>
      <View style={[
        styles.radioButton,
        selectedPayment === method.id && styles.radioButtonSelected
      ]} />
    </TouchableOpacity>
  );

  if (cartItems.length === 0) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Checkout</Text>
          <View style={styles.placeholder} />
        </View>
        
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No hay productos para procesar</Text>
          <TouchableOpacity
            style={styles.browseButton}
            onPress={() => navigation.navigate('Home')}
          >
            <Text style={styles.browseButtonText}>Ir al inicio</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

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
        <Text style={styles.headerTitle}>Checkout</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView 
        style={styles.content}
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Order Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Resumen del pedido</Text>
          <View style={styles.restaurantCard}>
            <Text style={styles.restaurantEmoji}>{restaurant?.image}</Text>
            <View style={styles.restaurantInfo}>
              <Text style={styles.restaurantName}>{restaurant?.name}</Text>
              <Text style={styles.itemCount}>{cartItems.length} productos</Text>
            </View>
            <Text style={styles.totalAmount}>${total.toFixed(2)}</Text>
          </View>
        </View>

        {/* Delivery Address */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dirección de entrega</Text>
          <TouchableOpacity
            style={styles.selectionCard}
            onPress={() => setShowAddressModal(true)}
          >
            <View style={styles.selectionContent}>
              <Text style={styles.selectionIcon}>
                {getSelectedAddress()?.icon || '📍'}
              </Text>
              <View style={styles.selectionDetails}>
                <Text style={styles.selectionTitle}>
                  {getSelectedAddress()?.type || 'Seleccionar dirección'}
                </Text>
                <Text style={styles.selectionSubtitle}>
                  {getSelectedAddress()?.address || 'Toca para seleccionar'}
                </Text>
              </View>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Payment Method */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Método de pago</Text>
          <TouchableOpacity
            style={styles.selectionCard}
            onPress={() => setShowPaymentModal(true)}
          >
            <View style={styles.selectionContent}>
              <Text style={styles.selectionIcon}>
                {getSelectedPaymentMethod()?.icon || '💳'}
              </Text>
              <View style={styles.selectionDetails}>
                <Text style={styles.selectionTitle}>
                  {getSelectedPaymentMethod()?.name || 'Seleccionar método'}
                </Text>
                <Text style={styles.selectionSubtitle}>
                  {getSelectedPaymentMethod()?.description || 'Toca para seleccionar'}
                </Text>
              </View>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Card Details (if card selected) */}
        {selectedPayment === PAYMENT_METHODS.CARD && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Datos de la tarjeta</Text>
            <View style={styles.cardForm}>
              <TextInput
                style={styles.cardInput}
                placeholder="Número de tarjeta"
                value={cardDetails.number}
                onChangeText={(text) => setCardDetails(prev => ({...prev, number: text}))}
                keyboardType="numeric"
                maxLength={19}
              />
              <View style={styles.cardRow}>
                <TextInput
                  style={[styles.cardInput, styles.cardInputHalf]}
                  placeholder="MM/AA"
                  value={cardDetails.expiry}
                  onChangeText={(text) => setCardDetails(prev => ({...prev, expiry: text}))}
                  keyboardType="numeric"
                  maxLength={5}
                />
                <TextInput
                  style={[styles.cardInput, styles.cardInputHalf]}
                  placeholder="CVV"
                  value={cardDetails.cvv}
                  onChangeText={(text) => setCardDetails(prev => ({...prev, cvv: text}))}
                  keyboardType="numeric"
                  maxLength={4}
                  secureTextEntry
                />
              </View>
              <TextInput
                style={styles.cardInput}
                placeholder="Nombre del titular"
                value={cardDetails.name}
                onChangeText={(text) => setCardDetails(prev => ({...prev, name: text}))}
                autoCapitalize="words"
              />
            </View>
          </View>
        )}

        {/* Special Instructions */}
        {specialInstructions && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Instrucciones especiales</Text>
            <View style={styles.instructionsCard}>
              <Text style={styles.instructionsText}>{specialInstructions}</Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Place Order Button */}
      <View style={[styles.checkoutContainer, { paddingBottom: insets.bottom + 20 }]}>
        <TouchableOpacity
          style={[styles.placeOrderButton, isOrderLoading && styles.placeOrderButtonDisabled]}
          onPress={handlePlaceOrder}
          disabled={isOrderLoading}
        >
          {isOrderLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.placeOrderButtonText}>
              Realizar pedido • ${total.toFixed(2)}
            </Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Address Selection Modal */}
      <Modal
        visible={showAddressModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAddressModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Seleccionar dirección</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowAddressModal(false)}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalScroll}>
              {savedAddresses.map(renderAddressOption)}
              
              <View style={styles.customAddressSection}>
                <Text style={styles.customAddressTitle}>Dirección personalizada</Text>
                <TextInput
                  style={styles.customAddressInput}
                  placeholder="Ingresa tu dirección completa"
                  value={customAddress}
                  onChangeText={setCustomAddress}
                  multiline
                />
                <TouchableOpacity
                  style={[
                    styles.optionItem,
                    selectedAddress === 'custom' && styles.optionItemSelected
                  ]}
                  onPress={() => {
                    if (customAddress.trim()) {
                      setSelectedAddress('custom');
                      setShowAddressModal(false);
                    }
                  }}
                  disabled={!customAddress.trim()}
                >
                  <Text style={styles.optionIcon}>📍</Text>
                  <View style={styles.optionDetails}>
                    <Text style={styles.optionTitle}>Usar dirección personalizada</Text>
                    <Text style={styles.optionSubtitle}>
                      {customAddress.trim() || 'Ingresa una dirección arriba'}
                    </Text>
                  </View>
                  <View style={[
                    styles.radioButton,
                    selectedAddress === 'custom' && styles.radioButtonSelected
                  ]} />
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Payment Method Modal */}
      <Modal
        visible={showPaymentModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowPaymentModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Método de pago</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowPaymentModal(false)}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalScroll}>
              {paymentMethods.map(renderPaymentOption)}
            </ScrollView>
          </View>
        </View>
      </Modal>
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
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ECF0F1',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 15,
  },
  // Restaurant card
  restaurantCard: {
    flexDirection: 'row',
    alignItems: 'center',
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
  itemCount: {
    fontSize: 14,
    color: '#7F8C8D',
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2ECC71',
  },
  // Selection cards
  selectionCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 15,
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  selectionIcon: {
    fontSize: 24,
    marginRight: 15,
  },
  selectionDetails: {
    flex: 1,
  },
  selectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
  },
  selectionSubtitle: {
    fontSize: 14,
    color: '#7F8C8D',
    marginTop: 2,
  },
  chevron: {
    fontSize: 18,
    color: '#BDC3C7',
    fontWeight: 'bold',
  },
  // Card form
  cardForm: {
    backgroundColor: '#F8F9FA',
    borderRadius: 15,
    padding: 15,
  },
  cardInput: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    color: '#2C3E50',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ECF0F1',
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardInputHalf: {
    width: '48%',
  },
  // Instructions
  instructionsCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 15,
    padding: 15,
  },
  instructionsText: {
    fontSize: 14,
    color: '#2C3E50',
    lineHeight: 20,
  },
  // Empty state
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 18,
    color: '#7F8C8D',
    marginBottom: 20,
    textAlign: 'center',
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
  // Checkout button
  checkoutContainer: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#ECF0F1',
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  placeOrderButton: {
    backgroundColor: '#2ECC71',
    height: 50,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#2ECC71',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  placeOrderButtonDisabled: {
    backgroundColor: '#BDC3C7',
    shadowOpacity: 0,
    elevation: 0,
  },
  placeOrderButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ECF0F1',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    color: '#7F8C8D',
  },
  modalScroll: {
    maxHeight: 400,
  },
  // Option items
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ECF0F1',
  },
  optionItemSelected: {
    backgroundColor: '#E3F2FD',
  },
  optionIcon: {
    fontSize: 24,
    marginRight: 15,
  },
  optionDetails: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
  },
  optionSubtitle: {
    fontSize: 14,
    color: '#7F8C8D',
    marginTop: 2,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#BDC3C7',
    marginLeft: 10,
  },
  radioButtonSelected: {
    borderColor: '#3498DB',
    backgroundColor: '#3498DB',
  },
  // Custom address
  customAddressSection: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#ECF0F1',
  },
  customAddressTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 15,
  },
  customAddressInput: {
    backgroundColor: '#F8F9FA',
    borderRadius: 10,
    padding: 15,
    fontSize: 14,
    color: '#2C3E50',
    marginBottom: 15,
    textAlignVertical: 'top',
    minHeight: 80,
    borderWidth: 1,
    borderColor: '#ECF0F1',
  },
});

export default CheckoutScreen;