import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';

export default function TransferenciaScreen() {
    const navigation = useNavigation();
    const [comprobante, setComprobante] = useState(null);

    const seleccionarImagen = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 1,
        });

        if (!result.canceled) {
            setComprobante(result.assets[0].uri);
        }
    };

    const enviarComprobante = () => {
        if (!comprobante) {
            Alert.alert('Error', 'Primero debes seleccionar una imagen del comprobante.');
            return;
        }

        // Aquí iría la lógica para subir el comprobante al backend
        Alert.alert('Comprobante enviado', 'Tu comprobante ha sido enviado correctamente.');

        // Volver al checkout o tracking
        navigation.goBack();
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Text style={styles.backText}>←</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Transferencia Bancaria</Text>
                <View style={{ width: 40 }} />
            </View>

            <View style={styles.box}>
                <Text style={styles.label}>Banco:</Text>
                <Text style={styles.text}>Banco Pichincha</Text>
                <Text style={styles.label}>Número de cuenta:</Text>
                <Text style={styles.text}>1234567890</Text>
                <Text style={styles.label}>Tipo:</Text>
                <Text style={styles.text}>Ahorros</Text>
                <Text style={styles.label}>Titular:</Text>
                <Text style={styles.text}>Juan Pérez</Text>
            </View>

            <TouchableOpacity style={styles.button} onPress={seleccionarImagen}>
                <Text style={styles.buttonText}>📷 Seleccionar comprobante</Text>
            </TouchableOpacity>

            {comprobante && (
                <Image source={{ uri: comprobante }} style={styles.preview} />
            )}

            <TouchableOpacity style={styles.sendButton} onPress={enviarComprobante}>
                <Text style={styles.sendButtonText}>Enviar comprobante</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 15,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#f0f0f0',
        justifyContent: 'center',
        alignItems: 'center',
    },
    backText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#2C3E50',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2C3E50',
    },
    box: {
        backgroundColor: '#F0F0F0',
        padding: 15,
        borderRadius: 10,
        marginBottom: 20,
    },
    label: {
        fontWeight: 'bold',
        marginTop: 10,
        color: '#34495E',
    },
    text: {
        fontSize: 16,
        color: '#2C3E50',
    },
    button: {
        backgroundColor: '#3498DB',
        padding: 15,
        borderRadius: 10,
        marginBottom: 20,
    },
    buttonText: {
        color: '#fff',
        textAlign: 'center',
        fontWeight: 'bold',
    },
    preview: {
        width: '100%',
        height: 250,
        resizeMode: 'contain',
        marginBottom: 20,
        borderRadius: 10,
    },
    sendButton: {
        backgroundColor: '#27AE60',
        padding: 15,
        borderRadius: 10,
    },
    sendButtonText: {
        color: '#fff',
        textAlign: 'center',
        fontWeight: 'bold',
    },
});