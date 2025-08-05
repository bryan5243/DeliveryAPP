import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageCircle, 
  Send, 
  Phone, 
  MoreVertical, 
  Clock, 
  Check, 
  CheckCheck,
  X,
  Minimize2,
  Maximize2,
  User,
  Store,
  Truck
} from 'lucide-react';

const ChatSystem = ({ orderId, userType, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isMinimized, setIsMinimized] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [chatType, setChatType] = useState('restaurant'); // 'restaurant' or 'delivery'
  const messagesEndRef = useRef(null);

  // Simular mensajes iniciales
  useEffect(() => {
    const initialMessages = [
      {
        id: 1,
        senderId: 'restaurant-123',
        senderType: 'restaurant',
        senderName: 'Pizza Italiana',
        content: '¡Hola! Hemos recibido tu pedido #' + orderId,
        timestamp: new Date(Date.now() - 300000).toISOString(),
        status: 'read'
      },
      {
        id: 2,
        senderId: 'customer-456',
        senderType: 'customer',
        senderName: 'Tú',
        content: 'Perfecto, ¿cuánto tiempo tardará?',
        timestamp: new Date(Date.now() - 240000).toISOString(),
        status: 'read'
      },
      {
        id: 3,
        senderId: 'restaurant-123',
        senderType: 'restaurant',
        senderName: 'Pizza Italiana',
        content: 'Aproximadamente 25-30 minutos. Te avisamos cuando esté listo.',
        timestamp: new Date(Date.now() - 180000).toISOString(),
        status: 'read'
      }
    ];
    setMessages(initialMessages);
  }, [orderId]);

  // Auto-scroll al final
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Simular estado de conexión
  useEffect(() => {
    const interval = setInterval(() => {
      setIsOnline(Math.random() > 0.1); // 90% uptime
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const sendMessage = () => {
    if (!newMessage.trim()) return;

    const message = {
      id: Date.now(),
      senderId: userType === 'customer' ? 'customer-456' : 'restaurant-123',
      senderType: userType,
      senderName: userType === 'customer' ? 'Tú' : 'Restaurante',
      content: newMessage.trim(),
      timestamp: new Date().toISOString(),
      status: 'sent'
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');

    // Simular respuesta automática
    setTimeout(() => {
      const autoResponse = {
        id: Date.now() + 1,
        senderId: userType === 'customer' ? 'restaurant-123' : 'customer-456',
        senderType: userType === 'customer' ? 'restaurant' : 'customer',
        senderName: userType === 'customer' ? 'Pizza Italiana' : 'Cliente',
        content: getAutoResponse(newMessage),
        timestamp: new Date().toISOString(),
        status: 'delivered'
      };
      setMessages(prev => [...prev, autoResponse]);
    }, 1000 + Math.random() * 2000);
  };

  const getAutoResponse = (message) => {
    const responses = {
      restaurant: [
        'Perfecto, seguimos preparando tu pedido.',
        'Gracias por tu paciencia.',
        'Te avisamos cuando esté listo.',
        'Cualquier cambio te lo confirmamos.',
        'Estamos trabajando en tu pedido.'
      ],
      customer: [
        'Entendido, gracias por avisar.',
        'Perfecto, esperamos la entrega.',
        'Muchas gracias por el update.',
        'Ok, seguimos pendientes.',
        'Gracias por la información.'
      ]
    };
    
    const targetType = userType === 'customer' ? 'restaurant' : 'customer';
    const availableResponses = responses[targetType];
    return availableResponses[Math.floor(Math.random() * availableResponses.length)];
  };

  const getMessageStatusIcon = (status) => {
    switch (status) {
      case 'sent':
        return <Check className="w-4 h-4 text-gray-400" />;
      case 'delivered':
        return <CheckCheck className="w-4 h-4 text-gray-400" />;
      case 'read':
        return <CheckCheck className="w-4 h-4 text-blue-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getSenderIcon = (senderType) => {
    switch (senderType) {
      case 'restaurant':
        return <Store className="w-5 h-5 text-orange-500" />;
      case 'delivery':
        return <Truck className="w-5 h-5 text-blue-500" />;
      default:
        return <User className="w-5 h-5 text-gray-500" />;
    }
  };

  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setIsMinimized(false)}
          className="bg-orange-500 text-white p-3 rounded-full shadow-lg hover:bg-orange-600 flex items-center space-x-2"
        >
          <MessageCircle className="w-5 h-5" />
          <span className="bg-red-500 text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {messages.filter(m => m.status !== 'read' && m.senderType !== userType).length}
          </span>
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 w-80 bg-white rounded-lg shadow-2xl border border-gray-200 z-50">
      {/* Header */}
      <div className="bg-orange-500 text-white p-4 rounded-t-lg flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {getSenderIcon(chatType)}
          <div>
            <h3 className="font-semibold">
              {chatType === 'restaurant' ? 'Pizza Italiana' : 'Repartidor'}
            </h3>
            <div className="flex items-center space-x-2 text-sm">
              <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-400' : 'bg-gray-400'}`} />
              <span>{isOnline ? 'En línea' : 'Desconectado'}</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button className="p-1 hover:bg-orange-600 rounded">
            <Phone className="w-4 h-4" />
          </button>
          <button 
            onClick={() => setIsMinimized(true)}
            className="p-1 hover:bg-orange-600 rounded"
          >
            <Minimize2 className="w-4 h-4" />
          </button>
          <button 
            onClick={onClose}
            className="p-1 hover:bg-orange-600 rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Selector de chat */}
      <div className="flex bg-gray-50 border-b">
        <button
          onClick={() => setChatType('restaurant')}
          className={`flex-1 py-2 px-4 text-sm font-medium ${
            chatType === 'restaurant' 
              ? 'bg-white text-orange-500 border-b-2 border-orange-500' 
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <Store className="w-4 h-4 inline mr-2" />
          Restaurante
        </button>
        <button
          onClick={() => setChatType('delivery')}
          className={`flex-1 py-2 px-4 text-sm font-medium ${
            chatType === 'delivery' 
              ? 'bg-white text-orange-500 border-b-2 border-orange-500' 
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <Truck className="w-4 h-4 inline mr-2" />
          Repartidor
        </button>
      </div>

      {/* Mensajes */}
      <div className="h-64 overflow-y-auto p-4 space-y-3">
        {messages.map(message => (
          <div
            key={message.id}
            className={`flex ${message.senderType === userType ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-xs px-3 py-2 rounded-lg ${
              message.senderType === userType
                ? 'bg-orange-500 text-white rounded-br-none'
                : 'bg-gray-100 text-gray-800 rounded-bl-none'
            }`}>
              <p className="text-sm">{message.content}</p>
              <div className={`flex items-center justify-between mt-1 text-xs ${
                message.senderType === userType ? 'text-orange-200' : 'text-gray-500'
              }`}>
                <span>{formatTime(message.timestamp)}</span>
                {message.senderType === userType && (
                  <div className="ml-2">
                    {getMessageStatusIcon(message.status)}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-gray-100 px-3 py-2 rounded-lg rounded-bl-none">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t bg-gray-50 rounded-b-lg">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Escribe un mensaje..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            disabled={!isOnline}
          />
          <button
            onClick={sendMessage}
            disabled={!newMessage.trim() || !isOnline}
            className="bg-orange-500 text-white p-2 rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

// Componente para mostrar la lista de chats
const ChatList = ({ orders, userType, onOpenChat }) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredOrders = orders.filter(order => 
    order.restaurant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.id.toString().includes(searchTerm)
  );

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="p-4 border-b">
        <h3 className="text-lg font-semibold mb-3">Mensajes</h3>
        <input
          type="text"
          placeholder="Buscar conversaciones..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
      </div>
      
      <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
        {filteredOrders.map(order => (
          <div
            key={order.id}
            onClick={() => onOpenChat(order.id)}
            className="p-4 hover:bg-gray-50 cursor-pointer"
          >
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center text-white font-semibold">
                {order.restaurant.name.charAt(0)}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold">{order.restaurant.name}</h4>
                  <span className="text-xs text-gray-500">
                    {new Date(order.timestamp).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm text-gray-600">Pedido #{order.id}</p>
                <div className="flex items-center space-x-2 mt-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-xs text-gray-500">En línea</span>
                </div>
              </div>
              <div className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                2
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export { ChatSystem, ChatList };