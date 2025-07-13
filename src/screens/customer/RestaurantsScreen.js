import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

const RestaurantsScreen = () => {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom + 80 }]}>
      <View style={styles.content}>
        <Text style={styles.title}>Restaurantes</Text>
        <Text style={styles.subtitle}>Aquí verás todos los restaurantes disponibles</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#fff' 
  },
  content: {
    flex: 1,
    justifyContent: 'center', 
    alignItems: 'center',
    paddingHorizontal: 20
  },
  title: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    color: '#2C3E50' 
  },
  subtitle: { 
    fontSize: 16, 
    color: '#7F8C8D', 
    marginTop: 10, 
    textAlign: 'center' 
  }
});

export default RestaurantsScreen;
