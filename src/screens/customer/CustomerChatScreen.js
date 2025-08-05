import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function CustomerChatScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([
    { id: '1', text: 'Hola, ¿ya viene mi pedido?', sender: 'cliente' },
    { id: '2', text: '¡Hola! Sí, estoy en camino.', sender: 'repartidor' },
  ]);

  const flatListRef = useRef();

  const handleSend = () => {
    if (message.trim() === '') return;
    const newMessage = {
      id: Date.now().toString(),
      text: message,
      sender: 'cliente',
    };
    setMessages((prev) => [...prev, newMessage]);
    setMessage('');
  };

  useEffect(() => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages]);

  const renderItem = ({ item }) => (
    <View
      style={[
        styles.bubble,
        item.sender === 'cliente' ? styles.bubbleRight : styles.bubbleLeft,
      ]}
    >
      <Text style={styles.messageText}>{item.text}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.inner}>
            {/* Header */}
            <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
              <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                <Text style={styles.backText}>←</Text>
              </TouchableOpacity>
              <Text style={styles.title}>Chat con el repartidor</Text>
              <View style={{ width: 35 }} />
            </View>

            {/* Mensajes */}
            <FlatList
              ref={flatListRef}
              data={messages}
              renderItem={renderItem}
              keyExtractor={(item) => item.id}
              contentContainerStyle={{ padding: 10, flexGrow: 1 }} // flexGrow en lugar de paddingBottom
              showsVerticalScrollIndicator={false}
              onContentSizeChange={() =>
                flatListRef.current?.scrollToEnd({ animated: true })
              }
            />


            {/* Input */}
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Escribe un mensaje..."
                value={message}
                onChangeText={setMessage}
                onSubmitEditing={handleSend}
                returnKeyType="send"
              />
              <TouchableOpacity onPress={handleSend} style={styles.sendButton}>
                <Text style={styles.sendButtonText}>📤</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
  },
  inner: {
    flex: 1,
    backgroundColor: '#fff',

  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ECF0F1',
    backgroundColor: '#fff',
  },
  backButton: {
    width: 35,
    height: 35,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 18,
  },
  backText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
  bubble: {
    padding: 12,
    marginVertical: 5,
    borderRadius: 18,
    maxWidth: '80%',
  },
  bubbleLeft: {
    backgroundColor: '#ecf0f1',
    alignSelf: 'flex-start',
  },
  bubbleRight: {
    backgroundColor: '#2ecc71',
    alignSelf: 'flex-end',
  },
  messageText: {
    fontSize: 15,
    color: '#2c3e50',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 8,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: '#fff',
    alignItems: 'center',
  },


  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: Platform.OS === 'ios' ? 10 : 6,
    marginRight: 10,
    fontSize: 15,
  },
  sendButton: {
    backgroundColor: '#3498db',
    padding: 10,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});
