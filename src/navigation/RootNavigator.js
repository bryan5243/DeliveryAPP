import React, { useEffect } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { ActivityIndicator, View, Platform, StatusBar } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { 
  selectIsAuthenticated, 
  selectIsLoading, 
  selectUserRole,
  loadStoredAuth,
  USER_ROLES 
} from '../store/slices/authSlice';

// Importar navegadores por rol
import AuthNavigator from './AuthNavigator';
import CustomerNavigator from './CustomerNavigator';
// Comentamos los otros navegadores por ahora para evitar errores
// import AdminNavigator from './AdminNavigator';
// import BusinessNavigator from './BusinessNavigator';
// import OwnerNavigator from './OwnerNavigator';
// import DeliveryNavigator from './DeliveryNavigator';

const Stack = createStackNavigator();

// Crear componente separado para evitar inline function
const MainNavigator = () => {
  const userRole = useSelector(selectUserRole);
  
  // Navegar según el rol del usuario
  switch (userRole) {
    case USER_ROLES.CUSTOMER:
      return <CustomerNavigator />;
    // TODO: Descomentar cuando creemos los otros navegadores
    // case USER_ROLES.ADMIN:
    //   return <AdminNavigator />;
    // case USER_ROLES.BUSINESS:
    //   return <BusinessNavigator />;
    // case USER_ROLES.OWNER:
    //   return <OwnerNavigator />;
    // case USER_ROLES.DELIVERY:
    //   return <DeliveryNavigator />;
    default:
      // Por ahora todos van a customer para testing
      return <CustomerNavigator />;
  }
};

const RootNavigator = () => {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isLoading = useSelector(selectIsLoading);
  const insets = useSafeAreaInsets();

  // Cargar datos de autenticación almacenados al iniciar
  useEffect(() => {
    dispatch(loadStoredAuth());
  }, [dispatch]);

  // Mostrar loading mientras se verifica la autenticación
  if (isLoading) {
    return (
      <View style={{ 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center',
        backgroundColor: '#ffffff',
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : insets.top
      }}>
        <ActivityIndicator size="large" color="#3498DB" />
      </View>
    );
  }

  // Si no está autenticado, mostrar pantallas de autenticación
  if (!isAuthenticated) {
    return <AuthNavigator />;
  }

  // Si está autenticado, mostrar el navegador principal
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Main" component={MainNavigator} />
    </Stack.Navigator>
  );
};

export default RootNavigator;