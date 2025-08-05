import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  Upload, 
  Eye, 
  Check, 
  X, 
  Clock, 
  AlertCircle,
  Building,
  Camera,
  Image,
  Download,
  RefreshCw,
  CheckCircle,
  XCircle,
  DollarSign,
  FileText,
  Calendar,
  User,
  Copy
} from 'lucide-react';

const BankTransferPayment = ({ order, onPaymentComplete, userType = 'customer' }) => {
  const [step, setStep] = useState(1); // 1: Info, 2: Upload, 3: Waiting, 4: Complete
  const [uploadedFile, setUploadedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState('pending'); // pending, validating, approved, rejected
  const [rejectionReason, setRejectionReason] = useState('');

  const bankInfo = order.restaurant.bankInfo || {
    bank: "Banco Pichincha",
    accountNumber: "2100123456",
    accountHolder: "Pizza Italiana S.A.",
    accountType: "Corriente",
    identification: "1792146739001"
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validar tipo de archivo
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      alert('Solo se permiten archivos JPG, PNG o PDF');
      return;
    }

    // Validar tamaño (5MB máximo)
    if (file.size > 5 * 1024 * 1024) {
      alert('El archivo no puede ser mayor a 5MB');
      return;
    }

    setUploadedFile(file);
    setIsUploading(true);
    setUploadProgress(0);

    // Crear preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target.result);
    };
    reader.readAsDataURL(file);

    // Simular progreso de subida
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          setIsUploading(false);
          setStep(3);
          setPaymentStatus('validating');
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const handleReupload = () => {
    setUploadedFile(null);
    setPreviewUrl(null);
    setUploadProgress(0);
    setStep(2);
    setPaymentStatus('pending');
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    // Aquí podrías mostrar una notificación de éxito
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-EC', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'validating': return 'text-blue-600 bg-blue-100';
      case 'approved': return 'text-green-600 bg-green-100';
      case 'rejected': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Clock className="w-5 h-5" />;
      case 'validating': return <RefreshCw className="w-5 h-5 animate-spin" />;
      case 'approved': return <CheckCircle className="w-5 h-5" />;
      case 'rejected': return <XCircle className="w-5 h-5" />;
      default: return <AlertCircle className="w-5 h-5" />;
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      {/* Resumen del pedido */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="font-semibold mb-3 flex items-center space-x-2">
          <FileText className="w-5 h-5 text-orange-500" />
          <span>Resumen del Pedido</span>
        </h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Pedido #{order.id}</span>
            <span className="font-medium">{order.restaurant.name}</span>
          </div>
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span>{formatCurrency(order.subtotal || 25.99)}</span>
          </div>
          <div className="flex justify-between">
            <span>Envío:</span>
            <span>{formatCurrency(order.deliveryFee || 3.50)}</span>
          </div>
          <div className="border-t pt-2 mt-2">
            <div className="flex justify-between font-bold">
              <span>Total a Transferir:</span>
              <span className="text-orange-600">{formatCurrency(order.total)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Información bancaria */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h3 className="font-semibold mb-4 flex items-center space-x-2">
          <Building className="w-5 h-5 text-blue-500" />
          <span>Datos Bancarios del Restaurante</span>
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-600">Banco</label>
              <div className="flex items-center justify-between bg-gray-50 p-2 rounded mt-1">
                <span className="font-medium">{bankInfo.bank}</span>
                <button 
                  onClick={() => copyToClipboard(bankInfo.bank)}
                  className="text-orange-500 hover:text-orange-600"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-600">Número de Cuenta</label>
              <div className="flex items-center justify-between bg-gray-50 p-2 rounded mt-1">
                <span className="font-mono font-medium">{bankInfo.accountNumber}</span>
                <button 
                  onClick={() => copyToClipboard(bankInfo.accountNumber)}
                  className="text-orange-500 hover:text-orange-600"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-600">Titular</label>
              <div className="flex items-center justify-between bg-gray-50 p-2 rounded mt-1">
                <span className="font-medium">{bankInfo.accountHolder}</span>
                <button 
                  onClick={() => copyToClipboard(bankInfo.accountHolder)}
                  className="text-orange-500 hover:text-orange-600"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-600">Tipo de Cuenta</label>
              <div className="bg-gray-50 p-2 rounded mt-1">
                <span className="font-medium">{bankInfo.accountType}</span>
              </div>
            </div>
          </div>
        </div>

        {bankInfo.identification && (
          <div className="mt-3">
            <label className="text-sm font-medium text-gray-600">RUC/Cédula</label>
            <div className="flex items-center justify-between bg-gray-50 p-2 rounded mt-1">
              <span className="font-mono font-medium">{bankInfo.identification}</span>
              <button 
                onClick={() => copyToClipboard(bankInfo.identification)}
                className="text-orange-500 hover:text-orange-600"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Instrucciones */}
      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
        <h4 className="font-semibold text-orange-800 mb-3 flex items-center space-x-2">
          <AlertCircle className="w-5 h-5" />
          <span>Instrucciones Importantes</span>
        </h4>
        <ol className="space-y-2 text-sm text-orange-700">
          <li className="flex items-start space-x-2">
            <span className="bg-orange-200 text-orange-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mt-0.5">1</span>
            <span>Realiza la transferencia por el monto exacto: <strong>{formatCurrency(order.total)}</strong></span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="bg-orange-200 text-orange-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mt-0.5">2</span>
            <span>En el concepto/referencia incluye: <strong>Pedido #{order.id}</strong></span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="bg-orange-200 text-orange-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mt-0.5">3</span>
            <span>Guarda el comprobante de la transferencia</span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="bg-orange-200 text-orange-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mt-0.5">4</span>
            <span>Sube el comprobante en el siguiente paso</span>
          </li>
        </ol>
      </div>

      <button 
        onClick={() => setStep(2)}
        className="w-full bg-orange-500 text-white py-3 rounded-lg hover:bg-orange-600 font-semibold flex items-center justify-center space-x-2"
      >
        <span>Ya realicé la transferencia</span>
        <Upload className="w-5 h-5" />
      </button>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold mb-2">Subir Comprobante</h3>
        <p className="text-gray-600">
          Sube el comprobante de tu transferencia para que podamos validar el pago
        </p>
      </div>

      {!uploadedFile ? (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-orange-400 transition-colors">
          <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h4 className="text-lg font-medium mb-2">Arrastra tu comprobante aquí</h4>
          <p className="text-gray-600 mb-4">o haz clic para seleccionar</p>
          
          <div className="flex justify-center space-x-4 mb-4">
            <label className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 cursor-pointer flex items-center space-x-2">
              <Camera className="w-4 h-4" />
              <span>Tomar Foto</span>
              <input 
                type="file" 
                accept="image/*" 
                capture="environment"
                onChange={handleFileUpload}
                className="hidden" 
              />
            </label>
            <label className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 cursor-pointer flex items-center space-x-2">
              <Image className="w-4 h-4" />
              <span>Galería</span>
              <input 
                type="file" 
                accept="image/*,application/pdf"
                onChange={handleFileUpload}
                className="hidden" 
              />
            </label>
          </div>
          
          <p className="text-xs text-gray-500">
            Formatos aceptados: JPG, PNG, PDF (máx. 5MB)
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Preview del archivo */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h4 className="font-semibold mb-3">Comprobante Subido</h4>
            <div className="flex items-center space-x-4">
              {previewUrl && uploadedFile.type.startsWith('image/') ? (
                <img 
                  src={previewUrl} 
                  alt="Comprobante" 
                  className="w-20 h-20 object-cover rounded border"
                />
              ) : (
                <div className="w-20 h-20 bg-red-100 rounded border flex items-center justify-center">
                  <FileText className="w-8 h-8 text-red-500" />
                </div>
              )}
              <div className="flex-1">
                <p className="font-medium">{uploadedFile.name}</p>
                <p className="text-sm text-gray-600">
                  {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
                <p className="text-xs text-gray-500">
                  Subido: {new Date().toLocaleString()}
                </p>
              </div>
              <button 
                onClick={handleReupload}
                className="text-orange-500 hover:text-orange-600"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Progreso de subida */}
          {isUploading && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Subiendo comprobante...</span>
                <span className="text-sm">{uploadProgress}%</span>
              </div>
              <div className="w-full bg-blue-200 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}
        </div>
      )}

      <div className="flex space-x-3">
        <button 
          onClick={() => setStep(1)}
          className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50"
        >
          Volver
        </button>
        {uploadedFile && !isUploading && (
          <button 
            onClick={() => {
              setStep(3);
              setPaymentStatus('validating');
              // Simular validación después de 3 segundos
              setTimeout(() => {
                setPaymentStatus('approved');
                setStep(4);
                onPaymentComplete?.();
              }, 3000);
            }}
            className="flex-1 bg-orange-500 text-white py-2 rounded-lg hover:bg-orange-600"
          >
            Confirmar Comprobante
          </button>
        )}
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="text-center space-y-6">
      <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
        <RefreshCw className="w-10 h-10 text-blue-500 animate-spin" />
      </div>
      
      <div>
        <h3 className="text-xl font-semibold mb-2">Validando Pago</h3>
        <p className="text-gray-600">
          El restaurante está revisando tu comprobante de pago.
          Te notificaremos cuando sea aprobado.
        </p>
      </div>

      <div className="bg-blue-50 p-4 rounded-lg">
        <div className="flex items-center justify-center space-x-2 text-blue-700">
          <Clock className="w-5 h-5" />
          <span className="font-medium">Tiempo estimado: 2-5 minutos</span>
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="text-center space-y-6">
      <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto ${
        paymentStatus === 'approved' ? 'bg-green-100' : 'bg-red-100'
      }`}>
        {paymentStatus === 'approved' ? (
          <CheckCircle className="w-10 h-10 text-green-500" />
        ) : (
          <XCircle className="w-10 h-10 text-red-500" />
        )}
      </div>
      
      <div>
        <h3 className="text-xl font-semibold mb-2">
          {paymentStatus === 'approved' ? '¡Pago Aprobado!' : 'Pago Rechazado'}
        </h3>
        <p className="text-gray-600">
          {paymentStatus === 'approved' 
            ? 'Tu pago ha sido validado exitosamente. El restaurante comenzará a preparar tu pedido.'
            : 'Hubo un problema con tu comprobante. Por favor, revisa los datos y vuelve a intentar.'
          }
        </p>
      </div>

      {paymentStatus === 'rejected' && rejectionReason && (
        <div className="bg-red-50 border border-red-200 p-4 rounded-lg text-left">
          <h4 className="font-semibold text-red-800 mb-2">Motivo del rechazo:</h4>
          <p className="text-red-700">{rejectionReason}</p>
        </div>
      )}

      {paymentStatus === 'approved' ? (
        <button 
          onClick={() => onPaymentComplete?.()}
          className="w-full bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 font-semibold"
        >
          Continuar
        </button>
      ) : (
        <div className="space-y-3">
          <button 
            onClick={handleReupload}
            className="w-full bg-orange-500 text-white py-3 rounded-lg hover:bg-orange-600 font-semibold"
          >
            Subir Nuevo Comprobante
          </button>
          <button className="w-full border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50">
            Contactar Soporte
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg">
      {/* Header con estado */}
      <div className="bg-orange-500 text-white p-4 rounded-t-lg">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Transferencia Bancaria</h2>
          <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm ${getStatusColor(paymentStatus)}`}>
            {getStatusIcon(paymentStatus)}
            <span className="capitalize">
              {paymentStatus === 'validating' ? 'Validando' : paymentStatus === 'approved' ? 'Aprobado' : paymentStatus === 'rejected' ? 'Rechazado' : 'Pendiente'}
            </span>
          </div>
        </div>
      </div>

      {/* Indicador de progreso */}
      <div className="px-4 py-3 bg-gray-50 border-b">
        <div className="flex items-center justify-between">
          {[1, 2, 3, 4].map((stepNumber) => (
            <div key={stepNumber} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                step >= stepNumber 
                  ? 'bg-orange-500 text-white' 
                  : 'bg-gray-300 text-gray-600'
              }`}>
                {stepNumber}
              </div>
              {stepNumber < 4 && (
                <div className={`w-12 h-1 mx-2 ${
                  step > stepNumber ? 'bg-orange-500' : 'bg-gray-300'
                }`} />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-2 text-xs text-gray-600">
          <span>Info Bancaria</span>
          <span>Subir Comprobante</span>
          <span>Validación</span>
          <span>Completado</span>
        </div>
      </div>

      {/* Contenido */}
      <div className="p-6">
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
        {step === 4 && renderStep4()}
      </div>
    </div>
  );
};

// Componente para que el restaurante valide pagos
const PaymentValidation = ({ pendingPayments, onValidatePayment }) => {
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);

  const validatePayment = (paymentId, approved, reason = '') => {
    onValidatePayment(paymentId, approved, reason);
    setSelectedPayment(null);
    setShowRejectModal(false);
    setRejectionReason('');
  };

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold">Validar Pagos</h3>
      
      {pendingPayments.length === 0 ? (
        <div className="text-center py-8">
          <CheckCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No hay pagos pendientes de validación</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {pendingPayments.map(payment => (
            <div key={payment.id} className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="font-semibold">Pedido #{payment.orderId}</h4>
                  <p className="text-sm text-gray-600">
                    Cliente: {payment.customerName} • {formatCurrency(payment.amount)}
                  </p>
                  <p className="text-xs text-gray-500">
                    Subido: {new Date(payment.uploadTime).toLocaleString()}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => validatePayment(payment.id, true)}
                    className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 flex items-center space-x-2"
                  >
                    <Check className="w-4 h-4" />
                    <span>Aprobar</span>
                  </button>
                  <button
                    onClick={() => {
                      setSelectedPayment(payment);
                      setShowRejectModal(true);
                    }}
                    className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 flex items-center space-x-2"
                  >
                    <X className="w-4 h-4" />
                    <span>Rechazar</span>
                  </button>
                </div>
              </div>
              
              {payment.receiptUrl && (
                <div className="mt-4">
                  <img 
                    src={payment.receiptUrl} 
                    alt="Comprobante" 
                    className="max-w-full h-48 object-contain border rounded"
                  />
                  <button className="mt-2 text-orange-500 hover:text-orange-600 flex items-center space-x-1">
                    <Eye className="w-4 h-4" />
                    <span>Ver en tamaño completo</span>
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal de rechazo */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <h4 className="font-semibold mb-4">Rechazar Pago</h4>
            <p className="text-gray-600 mb-4">
              Explica el motivo del rechazo para que el cliente pueda corregirlo:
            </p>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Ej: El monto no coincide, la imagen no es clara, etc."
              className="w-full p-3 border border-gray-300 rounded-lg resize-none h-24 mb-4"
            />
            <div className="flex space-x-3">
              <button
                onClick={() => setShowRejectModal(false)}
                className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={() => validatePayment(selectedPayment.id, false, rejectionReason)}
                disabled={!rejectionReason.trim()}
                className="flex-1 bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 disabled:opacity-50"
              >
                Rechazar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export { BankTransferPayment, PaymentValidation };