import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { submitRating, selectOrdersLoading } from '../store/slices/ordersSlice';

const RatingComponent = ({ visible, onClose, order }) => {
  const dispatch = useDispatch();
  const isLoading = useSelector(selectOrdersLoading);
  
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');

  const handleStarPress = (star) => {
    setRating(star);
  };

  const handleSubmitRating = async () => {
    if (rating === 0) {
      Alert.alert('Error', 'Por favor selecciona una calificación');
      return;
    }

    try {
      await dispatch(submitRating({
        orderId: order.id,
        rating,
        review: review.trim()
      })).unwrap();
      
      Alert.alert(
        'Calificación enviada',
        '¡Gracias por tu feedback! Tu calificación ayuda a mejorar el servicio.',
        [{ text: 'OK', onPress: onClose }]
      );
      
      // Reset form
      setRating(0);
      setReview('');
    } catch (error) {
      Alert.alert('Error', 'No se pudo enviar la calificación. Intenta de nuevo.');
    }
  };

  const renderStars = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <TouchableOpacity
          key={i}
          style={styles.starButton}
          onPress={() => handleStarPress(i)}
        >
          <Text style={[
            styles.star,
            { color: i <= rating ? '#F39C12' : '#BDC3C7' }
          ]}>
            ⭐
          </Text>
        </TouchableOpacity>
      );
    }
    return stars;
  };

  const getRatingText = () => {
    switch (rating) {
      case 1: return 'Muy malo';
      case 2: return 'Malo';
      case 3: return 'Regular';
      case 4: return 'Bueno';
      case 5: return 'Excelente';
      default: return 'Selecciona una calificación';
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Calificar pedido</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          {order && (
            <View style={styles.orderInfo}>
              <View style={styles.restaurantInfo}>
                <Text style={styles.restaurantEmoji}>{order.restaurant.image}</Text>
                <View>
                  <Text style={styles.restaurantName}>{order.restaurant.name}</Text>
                  <Text style={styles.orderDate}>
                    {new Date(order.createdAt).toLocaleDateString()}
                  </Text>
                </View>
              </View>
            </View>
          )}

          <View style={styles.ratingSection}>
            <Text style={styles.ratingLabel}>¿Cómo estuvo tu pedido?</Text>
            
            <View style={styles.starsContainer}>
              {renderStars()}
            </View>
            
            <Text style={styles.ratingText}>{getRatingText()}</Text>
          </View>

          <View style={styles.reviewSection}>
            <Text style={styles.reviewLabel}>Cuéntanos más (opcional)</Text>
            <TextInput
              style={styles.reviewInput}
              placeholder="Escribe tu reseña aquí..."
              placeholderTextColor="#BDC3C7"
              value={review}
              onChangeText={setReview}
              multiline
              numberOfLines={4}
              maxLength={500}
            />
            <Text style={styles.characterCount}>{review.length}/500</Text>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onClose}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
              onPress={handleSubmitRating}
              disabled={isLoading || rating === 0}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.submitButtonText}>Enviar calificación</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    width: '90%',
    maxWidth: 400,
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
  orderInfo: {
    backgroundColor: '#F8F9FA',
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
  },
  restaurantInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  restaurantEmoji: {
    fontSize: 30,
    marginRight: 15,
  },
  restaurantName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  orderDate: {
    fontSize: 14,
    color: '#7F8C8D',
    marginTop: 2,
  },
  ratingSection: {
    alignItems: 'center',
    marginBottom: 25,
  },
  ratingLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 20,
    textAlign: 'center',
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 15,
  },
  starButton: {
    padding: 5,
    marginHorizontal: 5,
  },
  star: {
    fontSize: 30,
  },
  ratingText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#7F8C8D',
  },
  reviewSection: {
    marginBottom: 25,
  },
  reviewLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 10,
  },
  reviewInput: {
    backgroundColor: '#F8F9FA',
    borderRadius: 15,
    padding: 15,
    fontSize: 14,
    color: '#2C3E50',
    textAlignVertical: 'top',
    minHeight: 100,
    borderWidth: 1,
    borderColor: '#ECF0F1',
  },
  characterCount: {
    fontSize: 12,
    color: '#BDC3C7',
    textAlign: 'right',
    marginTop: 5,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#ECF0F1',
    borderRadius: 15,
    paddingVertical: 15,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#7F8C8D',
  },
  submitButton: {
    flex: 1,
    backgroundColor: '#F39C12',
    borderRadius: 15,
    paddingVertical: 15,
    marginLeft: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#BDC3C7',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});

export default RatingComponent;