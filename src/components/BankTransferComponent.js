import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Modal,
  ScrollView,
  Image,
  ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';

const BankTransferComponent = ({ onBankSelected, onProofUploaded, selectedBank, paymentProof }) => {
  const [showBankModal, setShowBankModal] = useState(false);
  const [uploadingProof, setUploadingProof] = useState(false);

  // Mock de bancos disponibles (esto vendría de la configuración del dueño)
  const availableBanks = [
    {
      id: 'banco_pichincha',
      name: 'Banco Pichincha',
      accountNumber: '2100123456',
      accountType: 'Corriente',
      accountHolder: 'DeliveryApp S.A.',
      logo: '🏦'
    },
    {
      id: 'banco_guayaquil',
      name: 'Banco de Guayaquil',
      accountNumber: '0123456789',
      accountType: 'Ahorros',
      accountHolder: 'DeliveryApp S.A.',
      logo: '🏪'
    },
    {
      id: 'banco_pacifico',
      name: 'Banco del Pacífico',
      accountNumber: '5432167890',
      accountType: 'Corriente',
      accountHolder: 'DeliveryApp S.A.',
      logo: '🏛️'
    }
  ];

  const handleBankSelection = (bank) => {
    onBankSelected(bank);
    setShowBankModal(false);
  };

  const handleUploadProof = async () => {
    try {
      // Solicitar permisos
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert('Permisos necesarios', 'Se necesita acceso a la galería para subir el comprobante');
        return;
      }

      // Abrir galería
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setUploadingProof(true);
        
        // Simular upload
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const proofData = {
          uri: result.assets[0].uri,
          type: result.assets[0].type,
          fileName: `comprobante_${Date.now()}.jpg`,
          uploadedAt: new Date().toISOString(),
        };
        
        onProofUploaded(proofData);
        setUploadingProof(false);
        
        Alert.alert(
          'Comprobante subido',
          'Tu comprobante ha sido enviado. El restaurante lo revisará y confirmará tu pedido.'
        );
      }
    } catch (error) {
      setUploadingProof(false);
      Alert.alert('Error', 'No se pudo subir el comprobante. Intenta de nuevo.');
    }
  };

  const handleTakePhoto = async () => {
    try {
      // Solicitar permisos de cámara
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert('Permisos necesarios', 'Se necesita acceso a la cámara para tomar una foto');
        return;
      }

      // Abrir cámara
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setUploadingProof(true);
        
        // Simular upload
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const proofData = {
          uri: result.assets[0].uri,
          type: result.assets[0].type,
          fileName: `comprobante_${Date.now()}.jpg`,
          uploadedAt: new Date().toISOString(),
        };
        
        onProofUploaded(proofData);
        setUploadingProof(false);
        
        Alert.alert(
          'Comprobante subido',
          'Tu comprobante ha sido enviado. El restaurante lo revisará y confirmará tu pedido.'
        );
      }
    } catch (error) {
      setUploadingProof(false);
      Alert.alert('Error', 'No se pudo tomar la foto. Intenta de nuevo.');
    }
  };

  const showUploadOptions = () => {
    Alert.alert(
      'Subir comprobante',
      'Selecciona una opción',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Tomar foto', onPress: handleTakePhoto },
        { text: 'Desde galería', onPress: handleUploadProof }
      ]
    );
  };

  const renderBankItem = (bank) => (
    <TouchableOpacity
      key={bank.id}
      style={[
        styles.bankItem,
        selectedBank?.id === bank.id && styles.bankItemSelected
      ]}
      onPress={() => handleBankSelection(bank)}
    >
      <Text style={styles.bankLogo}>{bank.logo}</Text>
      <View style={styles.bankDetails}>
        <Text style={styles.bankName}>{bank.name}</Text>
        <Text style={styles.accountInfo}>
          {bank.accountType}: {bank.accountNumber}
        </Text>
        <Text style={styles.accountHolder}>{bank.accountHolder}</Text>
      </View>
      <View style={[
        styles.radioButton,
        selectedBank?.id === bank.id && styles.radioButtonSelected
      ]} />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Selección de banco */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Datos bancarios</Text>
        <TouchableOpacity
          style={styles.bankSelector}
          onPress={() => setShowBankModal(true)}
        >
          {selectedBank ? (
            <View style={styles.selectedBankInfo}>
              <Text style={styles.selectedBankLogo}>{selectedBank.logo}</Text>
              <View style={styles.selectedBankDetails}>
                <Text style={styles.selectedBankName}>{selectedBank.name}</Text>
                <Text style={styles.selectedAccountInfo}>
                  {selectedBank.accountType}: {selectedBank.accountNumber}
                </Text>
                <Text style={styles.selectedAccountHolder}>
                  A nombre de: {selectedBank.accountHolder}
                </Text>
              </View>
            </View>
          ) : (
            <Text style={styles.bankSelectorText}>Seleccionar banco</Text>
          )}
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>
      </View>

      {/* Subida de comprobante */}
      {selectedBank && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Comprobante de pago</Text>
          <Text style={styles.instructionText}>
            Realiza la transferencia y sube el comprobante para confirmar tu pedido
          </Text>
          
          {paymentProof ? (
            <View style={styles.proofContainer}>
              <Image source={{ uri: paymentProof.uri }} style={styles.proofImage} />
              <View style={styles.proofInfo}>
                <Text style={styles.proofStatus}>✅ Comprobante subido</Text>
                <Text style={styles.proofDate}>
                  {new Date(paymentProof.uploadedAt).toLocaleString()}
                </Text>
                <TouchableOpacity
                  style={styles.changeProofButton}
                  onPress={showUploadOptions}
                >
                  <Text style={styles.changeProofText}>Cambiar comprobante</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <TouchableOpacity
              style={[styles.uploadButton, uploadingProof && styles.uploadButtonDisabled]}
              onPress={showUploadOptions}
              disabled={uploadingProof}
            >
              {uploadingProof ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Text style={styles.uploadIcon}>📎</Text>
                  <Text style={styles.uploadText}>Subir comprobante</Text>
                </>
              )}
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Modal de selección de banco */}
      <Modal
        visible={showBankModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowBankModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Seleccionar banco</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowBankModal(false)}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalScroll}>
              {availableBanks.map(renderBankItem)}
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
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 15,
  },
  // Bank selector
  bankSelector: {
    backgroundColor: '#F8F9FA',
    borderRadius: 15,
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ECF0F1',
  },
  bankSelectorText: {
    fontSize: 16,
    color: '#7F8C8D',
  },
  selectedBankInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  selectedBankLogo: {
    fontSize: 30,
    marginRight: 15,
  },
  selectedBankDetails: {
    flex: 1,
  },
  selectedBankName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
  },
  selectedAccountInfo: {
    fontSize: 14,
    color: '#7F8C8D',
    marginTop: 2,
  },
  selectedAccountHolder: {
    fontSize: 12,
    color: '#95A5A6',
    marginTop: 2,
  },
  chevron: {
    fontSize: 18,
    color: '#BDC3C7',
    fontWeight: 'bold',
  },
  // Instructions and upload
  instructionText: {
    fontSize: 14,
    color: '#7F8C8D',
    marginBottom: 15,
    lineHeight: 20,
  },
  uploadButton: {
    backgroundColor: '#3498DB',
    borderRadius: 15,
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadButtonDisabled: {
    backgroundColor: '#BDC3C7',
  },
  uploadIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  uploadText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  // Proof container
  proofContainer: {
    backgroundColor: '#F8F9FA',
    borderRadius: 15,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },
  proofImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
    marginRight: 15,
  },
  proofInfo: {
    flex: 1,
  },
  proofStatus: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2ECC71',
  },
  proofDate: {
    fontSize: 12,
    color: '#7F8C8D',
    marginTop: 2,
  },
  changeProofButton: {
    marginTop: 10,
  },
  changeProofText: {
    fontSize: 14,
    color: '#3498DB',
    textDecorationLine: 'underline',
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
  // Bank items
  bankItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ECF0F1',
  },
  bankItemSelected: {
    backgroundColor: '#E3F2FD',
  },
  bankLogo: {
    fontSize: 30,
    marginRight: 15,
  },
  bankDetails: {
    flex: 1,
  },
  bankName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
  },
  accountInfo: {
    fontSize: 14,
    color: '#7F8C8D',
    marginTop: 2,
  },
  accountHolder: {
    fontSize: 12,
    color: '#95A5A6',
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
});

export default BankTransferComponent;