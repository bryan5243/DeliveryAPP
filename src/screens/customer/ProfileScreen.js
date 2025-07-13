import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser, selectUser } from '../../store/slices/authSlice';

const ProfileScreen = () => {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const insets = useSafeAreaInsets();

  const handleLogout = () => {
    dispatch(logoutUser());
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom + 80 }]}>
      <View style={styles.content}>
        <Text style={styles.title}>Mi Perfil</Text>
        <Text style={styles.subtitle}>Hola {user?.name}</Text>
        <Text style={styles.email}>{user?.email}</Text>
        <Text style={styles.role}>Rol: {user?.role}</Text>
        
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Cerrar Sesión</Text>
        </TouchableOpacity>
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
    color: '#2C3E50',
    marginBottom: 10
  },
  subtitle: { 
    fontSize: 18, 
    color: '#3498DB', 
    marginBottom: 10
  },
  email: {
    fontSize: 16,
    color: '#7F8C8D',
    marginBottom: 10
  },
  role: {
    fontSize: 14,
    color: '#95A5A6',
    marginBottom: 30,
    textTransform: 'capitalize'
  },
  logoutButton: { 
    backgroundColor: '#E74C3C', 
    paddingHorizontal: 30, 
    paddingVertical: 15, 
    borderRadius: 25
  },
  logoutButtonText: { 
    color: '#fff', 
    fontWeight: '600',
    fontSize: 16
  }
});

export default ProfileScreen;
