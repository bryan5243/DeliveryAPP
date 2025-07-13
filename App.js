import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { Provider as PaperProvider } from 'react-native-paper';
import { Provider as ReduxProvider } from 'react-redux';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Platform } from 'react-native';
import * as Location from 'expo-location';
import { store } from './src/store/store';
import RootNavigator from './src/navigation/RootNavigator';
import { theme } from './src/utils/theme';
import { initializeFirebase } from './src/services/firebase/config';

// Inicializar Firebase
initializeFirebase();

const App = () => {
  useEffect(() => {
    requestLocationPermission();
  }, []);

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('Permission to access location was denied');
      }
    } catch (error) {
      console.error('Error requesting location permission:', error);
    }
  };

  return (
    <SafeAreaProvider>
      <ReduxProvider store={store}>
        <PaperProvider theme={theme}>
          <NavigationContainer>
            <StatusBar 
              style="dark" 
              translucent={Platform.OS === 'android'}
            />
            <RootNavigator />
          </NavigationContainer>
        </PaperProvider>
      </ReduxProvider>
    </SafeAreaProvider>
  );
};

export default App;