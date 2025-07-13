import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  TextInput,
  FlatList
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { selectUser, logoutUser } from '../../store/slices/authSlice';
import { selectCartItemCount } from '../../store/slices/cartSlice';
import * as Location from 'expo-location';

const { width } = Dimensions.get('window');

const HomeScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const cartItemCount = useSelector(selectCartItemCount);
  const insets = useSafeAreaInsets();
  const [location, setLocation] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Mock data para restaurantes populares
  const [popularRestaurants] = useState([
    {
      id: '1',
      name: 'Pizza Palace',
      category: 'Pizza',
      rating: 4.5,
      deliveryTime: '25-35 min',
      deliveryFee: 2.50,
      image: '🍕',
      isOpen: true
    },
    {
      id: '2',
      name: 'Burger House',
      category: 'Hamburguesas',
      rating: 4.2,
      deliveryTime: '20-30 min',
      deliveryFee: 1.99,
      image: '🍔',
      isOpen: true
    },
    {
      id: '3',
      name: 'Sushi Master',
      category: 'Japonesa',
      rating: 4.8,
      deliveryTime: '35-45 min',
      deliveryFee: 3.50,
      image: '🍣',
      isOpen: false
    }
  ]);

  const [categories] = useState([
    { id: '1', name: 'Pizza', icon: '🍕' },
    { id: '2', name: 'Hamburguesas', icon: '🍔' },
    { id: '3', name: 'Sushi', icon: '🍣' },
    { id: '4', name: 'Mexicana', icon: '🌮' },
    { id: '5', name: 'Italiana', icon: '🍝' },
    { id: '6', name: 'Postres', icon: '🍰' }
  ]);

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const currentLocation = await Location.getCurrentPositionAsync({});
        setLocation(currentLocation);
      }
    } catch (error) {
      console.error('Error getting location:', error);
    }
  };

  const handleLogout = () => {
    dispatch(logoutUser());
  };

  const renderRestaurantCard = ({ item }) => (
    <TouchableOpacity 
      style={styles.restaurantCard}
      onPress={() => navigation.navigate('RestaurantDetail', { restaurant: item })}
    >
      <View style={styles.restaurantImage}>
        <Text style={styles.restaurantEmoji}>{item.image}</Text>
        {!item.isOpen && (
          <View style={styles.closedOverlay}>
            <Text style={styles.closedText}>Cerrado</Text>
          </View>
        )}
      </View>
      <View style={styles.restaurantInfo}>
        <Text style={styles.restaurantName}>{item.name}</Text>
        <Text style={styles.restaurantCategory}>{item.category}</Text>
        <View style={styles.restaurantMeta}>
          <Text style={styles.rating}>⭐ {item.rating}</Text>
          <Text style={styles.deliveryTime}>{item.deliveryTime}</Text>
          <Text style={styles.deliveryFee}>Envío ${item.deliveryFee}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderCategoryItem = ({ item }) => (
    <TouchableOpacity style={styles.categoryItem}>
      <Text style={styles.categoryIcon}>{item.icon}</Text>
      <Text style={styles.categoryName}>{item.name}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.locationContainer}>
          <Text style={styles.locationLabel}>Entregar en</Text>
          <Text style={styles.locationText}>
            {location ? '📍 Tu ubicación actual' : '📍 Obtener ubicación'}
          </Text>
        </View>
        <TouchableOpacity 
          style={styles.profileButton} 
          onPress={() => navigation.navigate('Cart')}
        >
          <Text style={styles.profileIcon}>🛒</Text>
          {cartItemCount > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{cartItemCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 80 }]}
      >
        {/* Bienvenida */}
        <View style={styles.welcomeContainer}>
          <Text style={styles.welcomeText}>
            ¡Hola {user?.name}! 👋
          </Text>
          <Text style={styles.welcomeSubtext}>
            ¿Qué quieres comer hoy?
          </Text>
        </View>

        {/* Barra de búsqueda */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar restaurantes o comida..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <TouchableOpacity style={styles.searchButton}>
            <Text style={styles.searchIcon}>🔍</Text>
          </TouchableOpacity>
        </View>

        {/* Categorías */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Categorías</Text>
          <FlatList
            data={categories}
            renderItem={renderCategoryItem}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.categoriesList}
          />
        </View>

        {/* Restaurantes populares */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Populares cerca de ti</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Restaurants')}>
              <Text style={styles.seeAllText}>Ver todos</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={popularRestaurants}
            renderItem={renderRestaurantCard}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.restaurantsList}
          />
        </View>

        {/* Banner promocional */}
        <View style={styles.promoContainer}>
          <View style={styles.promoBanner}>
            <Text style={styles.promoTitle}>🎉 Envío gratis</Text>
            <Text style={styles.promoSubtitle}>En pedidos mayores a $25</Text>
            <TouchableOpacity style={styles.promoButton}>
              <Text style={styles.promoButtonText}>Pedir ahora</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ECF0F1',
    backgroundColor: '#fff',
  },
  locationContainer: {
    flex: 1,
  },
  locationLabel: {
    fontSize: 12,
    color: '#7F8C8D',
  },
  locationText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C3E50',
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileIcon: {
    fontSize: 20,
  },
  cartBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#E74C3C',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  welcomeContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  welcomeSubtext: {
    fontSize: 16,
    color: '#7F8C8D',
    marginTop: 5,
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  searchInput: {
    flex: 1,
    height: 50,
    backgroundColor: '#F8F9FA',
    borderRadius: 25,
    paddingHorizontal: 20,
    fontSize: 16,
  },
  searchButton: {
    width: 50,
    height: 50,
    backgroundColor: '#3498DB',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  searchIcon: {
    fontSize: 20,
  },
  section: {
    marginBottom: 25,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  seeAllText: {
    fontSize: 14,
    color: '#3498DB',
    fontWeight: '600',
  },
  categoriesList: {
    paddingLeft: 20,
  },
  categoryItem: {
    alignItems: 'center',
    marginRight: 20,
    width: 80,
  },
  categoryIcon: {
    fontSize: 40,
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 12,
    color: '#2C3E50',
    textAlign: 'center',
  },
  restaurantsList: {
    paddingLeft: 20,
  },
  restaurantCard: {
    width: width * 0.7,
    marginRight: 15,
    backgroundColor: '#fff',
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  restaurantImage: {
    height: 120,
    backgroundColor: '#F8F9FA',
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  restaurantEmoji: {
    fontSize: 40,
  },
  closedOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closedText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  restaurantInfo: {
    padding: 15,
  },
  restaurantName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 5,
  },
  restaurantCategory: {
    fontSize: 14,
    color: '#7F8C8D',
    marginBottom: 10,
  },
  restaurantMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rating: {
    fontSize: 12,
    color: '#F39C12',
  },
  deliveryTime: {
    fontSize: 12,
    color: '#7F8C8D',
  },
  deliveryFee: {
    fontSize: 12,
    color: '#2ECC71',
    fontWeight: '600',
  },
  promoContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  promoBanner: {
    backgroundColor: '#3498DB',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
  },
  promoTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  promoSubtitle: {
    fontSize: 14,
    color: '#fff',
    marginBottom: 15,
  },
  promoButton: { 
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  promoButtonText: {
    color: '#3498DB',
    fontWeight: '600',
  },
});

export default HomeScreen;