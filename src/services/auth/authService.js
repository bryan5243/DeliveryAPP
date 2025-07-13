// Mock service para desarrollo - reemplazar con API real más adelante

const API_BASE_URL = 'http://localhost:3000/api'; // Cambiar por tu URL de API

class AuthService {
  // Mock login - simula llamada a API
  async login(email, password) {
    try {
      // Simulamos delay de red
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock de usuarios para testing
      const mockUsers = {
        'admin@delivery.com': {
          id: '1',
          email: 'admin@delivery.com',
          name: 'Administrador',
          role: 'admin'
        },
        'business@test.com': {
          id: '2',
          email: 'business@test.com',
          name: 'Negocio Test',
          role: 'business'
        },
        'customer@test.com': {
          id: '3',
          email: 'customer@test.com',
          name: 'Cliente Test',
          role: 'customer'
        },
        'delivery@test.com': {
          id: '4',
          email: 'delivery@test.com',
          name: 'Delivery Test',
          role: 'delivery'
        },
        'owner@test.com': {
          id: '5',
          email: 'owner@test.com',
          name: 'Dueño Test',
          role: 'owner'
        }
      };

      const user = mockUsers[email];
      
      if (!user || password !== '123456') {
        throw new Error('Credenciales inválidas');
      }

      return {
        user,
        token: `mock-token-${user.id}-${Date.now()}`,
        success: true
      };
    } catch (error) {
      throw new Error(error.message || 'Error al iniciar sesión');
    }
  }

  // Mock register
  async register(userData) {
    try {
      // Simulamos delay de red
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock de registro exitoso
      const user = {
        id: `mock-${Date.now()}`,
        email: userData.email,
        name: userData.name,
        phone: userData.phone || '',
        role: 'customer' // Por defecto los registros son clientes
      };

      return {
        user,
        token: `mock-token-${user.id}`,
        success: true
      };
    } catch (error) {
      throw new Error(error.message || 'Error al registrarse');
    }
  }

  // Verificar token
  async verifyToken(token) {
    try {
      // Mock - aceptamos cualquier token que empiece con 'mock-token'
      if (token && token.startsWith('mock-token')) {
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error verifying token:', error);
      return false;
    }
  }

  // Logout
  async logout() {
    try {
      // Por ahora solo limpiar datos locales
      return { success: true };
    } catch (error) {
      console.error('Error during logout:', error);
      return { success: false };
    }
  }
}

// Crear instancia única
export const authService = new AuthService();
export default authService;