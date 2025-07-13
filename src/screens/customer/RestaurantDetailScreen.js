import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  FlatList,
  Modal,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart, selectCartItemCount } from '../../store/slices/cartSlice';

const { width } = Dimensions.get('window');

const RestaurantDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();
  const cartItemCount = useSelector(selectCartItemCount);
  
  const { restaurant } = route.params;
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showProductModal, setShowProductModal] = useState(false);
  const [productQuantity, setProductQuantity] = useState(1);

  // Mock data para categorías y productos
  const [categories] = useState([
    { id: 'all', name: 'Todo' },
    { id: 'pizzas', name: 'Pizzas' },
    { id: 'bebidas', name: 'Bebidas' },
    { id: 'postres', name: 'Postres' },
  ]);

  const [products] = useState([
    {
      id: '1',
      name: 'Pizza Margherita',
      description: 'Salsa de tomate, mozzarella fresca, albahaca y aceite de oliva',
      price: 18.99,
      image: '🍕',
      category: 'pizzas',
      rating: 4.8,
      preparationTime: '15-20 min',
      isPopular: true,
    },
    {
      id: '2',
      name: 'Pizza Pepperoni',
      description: 'Salsa de tomate, mozzarella y pepperoni italiano',
      price: 21.99,
      image: '🍕',
      category: 'pizzas',
      rating: 4.9,
      preparationTime: '15-20 min',
      isPopular: true,
    },
    {
      id: '3',
      name: 'Coca Cola',
      description: 'Refresco de cola 500ml',
      price: 2.99,
      image: '🥤',
      category: 'bebidas',
      rating: 4.5,
      preparationTime: '1 min',
    },
    {
      id: '4',
      name: 'Tiramisu',
      description: 'Postre italiano con café, mascarpone y cacao',
      price: 8.99,
      image: '🍰',
      category: 'postres',
      rating: 4.7,
      preparationTime: '5 min',
    },
  ]);

  const filteredProducts = selectedCategory === 'all' 
    ? products 
    : products.filter(product => product.category === selectedCategory);

  const handleAddToCart = () => {
    if (selectedProduct) {
      dispatch(addToCart({
        product: selectedProduct,
        restaurant: restaurant,
        quantity: productQuantity,
      }));
      
      setShowProductModal(false);
      setProductQuantity(1);
      
      Alert.alert(
        'Producto agregado',
        `${selectedProduct.name} ha sido agregado al carrito`,
        [{ text: 'OK' }]
      );
    }
  };

  const openProductModal = (product) => {
    setSelectedProduct(product);
    setProductQuantity(1);
    setShowProductModal(true);
  };

  const renderCategory = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.categoryButton,
        selectedCategory === item.id && styles.categoryButtonActive
      ]}
      onPress={() => setSelectedCategory(item.id)}
    >
      <Text style={[
        styles.categoryText,
        selectedCategory === item.id && styles.categoryTextActive
      ]}>
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  const renderProduct = ({ item }) => (
    <TouchableOpacity
      style={styles.productCard}
      onPress={() => openProductModal(item)}
    >
      <View style={styles.productImageContainer}>
        <Text style={styles.productEmoji}>{item.image}</Text>
        {item.isPopular && (
          <View style={styles.popularBadge}>
            <Text style={styles.popularText}>Popular</Text>
          </View>
        )}
      </View>
      
      <View style={styles.productInfo}>
        <Text style={styles.productName}>{item.name}</Text>
        <Text style={styles.productDescription} numberOfLines={2}>
          {item.description}
        </Text>
        
        <View style={styles.productMeta}>
          <Text style={styles.productRating}>⭐ {item.rating}</Text>
          <Text style={styles.productTime}>⏱️ {item.preparationTime}</Text>
        </View>
        
        <View style={styles.productFooter}>
          <Text style={styles.productPrice}>${item.price}</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => openProductModal(item)}
          >
            <Text style={styles.addButtonText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

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
        
        <Text style={styles.headerTitle}>{restaurant.name}</Text>
        
        <TouchableOpacity
          style={styles.cartButton}
          onPress={() => navigation.navigate('Cart')}
        >
          <Text style={styles.cartIcon}>🛒</Text>
          {cartItemCount > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{cartItemCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Restaurant Info */}
        <View style={styles.restaurantInfo}>
          <View style={styles.restaurantImageContainer}>
            <Text style={styles.restaurantEmoji}>{restaurant.image}</Text>
          </View>
          
          <View style={styles.restaurantDetails}>
            <Text style={styles.restaurantName}>{restaurant.name}</Text>
            <Text style={styles.restaurantCategory}>{restaurant.category}</Text>
            
            <View style={styles.restaurantMeta}>
              <Text style={styles.restaurantRating}>⭐ {restaurant.rating}</Text>
              <Text style={styles.restaurantTime}>⏱️ {restaurant.deliveryTime}</Text>
              <Text style={styles.restaurantFee}>🚚 ${restaurant.deliveryFee}</Text>
            </View>
            
            <View style={styles.restaurantStatus}>
              <View style={[styles.statusDot, { backgroundColor: restaurant.isOpen ? '#2ECC71' : '#E74C3C' }]} />
              <Text style={styles.statusText}>
                {restaurant.isOpen ? 'Abierto ahora' : 'Cerrado'}
              </Text>
            </View>
          </View>
        </View>

        {/* Categories */}
        <View style={styles.categoriesSection}>
          <Text style={styles.sectionTitle}>Categorías</Text>
          <FlatList
            data={categories}
            renderItem={renderCategory}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.categoriesList}
          />
        </View>

        {/* Products */}
        <View style={styles.productsSection}>
          <Text style={styles.sectionTitle}>
            {selectedCategory === 'all' ? 'Todos los productos' : categories.find(c => c.id === selectedCategory)?.name}
          </Text>
          
          <FlatList
            data={filteredProducts}
            renderItem={renderProduct}
            keyExtractor={(item) => item.id}
            numColumns={2}
            columnWrapperStyle={styles.productRow}
            scrollEnabled={false}
          />
        </View>
      </ScrollView>

      {/* Product Modal */}
      <Modal
        visible={showProductModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowProductModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedProduct && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>{selectedProduct.name}</Text>
                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={() => setShowProductModal(false)}
                  >
                    <Text style={styles.closeButtonText}>✕</Text>
                  </TouchableOpacity>
                </View>
                
                <View style={styles.modalProductImage}>
                  <Text style={styles.modalProductEmoji}>{selectedProduct.image}</Text>
                </View>
                
                <Text style={styles.modalProductDescription}>
                  {selectedProduct.description}
                </Text>
                
                <View style={styles.modalProductMeta}>
                  <Text style={styles.modalProductRating}>⭐ {selectedProduct.rating}</Text>
                  <Text style={styles.modalProductTime}>⏱️ {selectedProduct.preparationTime}</Text>
                </View>
                
                <View style={styles.quantitySection}>
                  <Text style={styles.quantityLabel}>Cantidad:</Text>
                  <View style={styles.quantityControls}>
                    <TouchableOpacity
                      style={styles.quantityButton}
                      onPress={() => setProductQuantity(Math.max(1, productQuantity - 1))}
                    >
                      <Text style={styles.quantityButtonText}>-</Text>
                    </TouchableOpacity>
                    <Text style={styles.quantityText}>{productQuantity}</Text>
                    <TouchableOpacity
                      style={styles.quantityButton}
                      onPress={() => setProductQuantity(productQuantity + 1)}
                    >
                      <Text style={styles.quantityButtonText}>+</Text>
                    </TouchableOpacity>
                  </View>
                </View>
                
                <TouchableOpacity
                  style={styles.addToCartButton}
                  onPress={handleAddToCart}
                >
                  <Text style={styles.addToCartButtonText}>
                    Agregar al carrito - ${(selectedProduct.price * productQuantity).toFixed(2)}
                  </Text>
                </TouchableOpacity>
              </>
            )}
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
  cartButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#3498DB',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  cartIcon: {
    fontSize: 18,
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
  content: {
    flex: 1,
  },
  restaurantInfo: {
    flexDirection: 'row',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ECF0F1',
  },
  restaurantImageContainer: {
    width: 80,
    height: 80,
    backgroundColor: '#F8F9FA',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  restaurantEmoji: {
    fontSize: 40,
  },
  restaurantDetails: {
    flex: 1,
  },
  restaurantName: {
    fontSize: 20,
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
    alignItems: 'center',
    marginBottom: 10,
  },
  restaurantRating: {
    fontSize: 12,
    color: '#F39C12',
    marginRight: 15,
  },
  restaurantTime: {
    fontSize: 12,
    color: '#7F8C8D',
    marginRight: 15,
  },
  restaurantFee: {
    fontSize: 12,
    color: '#2ECC71',
  },
  restaurantStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 5,
  },
  statusText: {
    fontSize: 12,
    color: '#2C3E50',
    fontWeight: '500',
  },
  categoriesSection: {
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
  categoriesList: {
    marginLeft: -10,
  },
  categoryButton: {
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginLeft: 10,
  },
  categoryButtonActive: {
    backgroundColor: '#3498DB',
  },
  categoryText: {
    fontSize: 14,
    color: '#7F8C8D',
    fontWeight: '500',
  },
  categoryTextActive: {
    color: '#fff',
  },
  productsSection: {
    padding: 20,
  },
  productRow: {
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  productCard: {
    width: (width - 55) / 2,
    backgroundColor: '#fff',
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  productImageContainer: {
    height: 120,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  productEmoji: {
    fontSize: 40,
  },
  popularBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#E74C3C',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  popularText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  productInfo: {
    padding: 12,
  },
  productName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 5,
  },
  productDescription: {
    fontSize: 12,
    color: '#7F8C8D',
    marginBottom: 8,
    lineHeight: 16,
  },
  productMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  productRating: {
    fontSize: 10,
    color: '#F39C12',
  },
  productTime: {
    fontSize: 10,
    color: '#7F8C8D',
  },
  productFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2ECC71',
  },
  addButton: {
    width: 30,
    height: 30,
    backgroundColor: '#3498DB',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 18,
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
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
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
  modalProductImage: {
    height: 150,
    backgroundColor: '#F8F9FA',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalProductEmoji: {
    fontSize: 60,
  },
  modalProductDescription: {
    fontSize: 16,
    color: '#7F8C8D',
    lineHeight: 24,
    marginBottom: 15,
  },
  modalProductMeta: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
    paddingVertical: 15,
    backgroundColor: '#F8F9FA',
    borderRadius: 10,
  },
  modalProductRating: {
    fontSize: 14,
    color: '#F39C12',
  },
  modalProductTime: {
    fontSize: 14,
    color: '#7F8C8D',
  },
  quantitySection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  quantityLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#3498DB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  quantityText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginHorizontal: 20,
  },
  addToCartButton: {
    backgroundColor: '#2ECC71',
    height: 50,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addToCartButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default RestaurantDetailScreen;