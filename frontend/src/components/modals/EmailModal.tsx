import { useState } from 'react';
import { X, Mail, Loader } from 'lucide-react';
import { VentaDetallada } from '@/types';
import { reportesService } from '@/services/reportesService';
import Swal from 'sweetalert2';

interface EmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  venta: VentaDetallada | null;
}

export const EmailModal = ({ isOpen, onClose, venta }: EmailModalProps) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sendBoleta, setSendBoleta] = useState(true);
  const [sendFactura, setSendFactura] = useState(true);

  if (!isOpen || !venta) return null;

  const handleSendEmail = async () => {
    if (!email.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Email requerido',
        text: 'Por favor ingresa un email válido',
      });
      return;
    }

    if (!sendBoleta && !sendFactura) {
      Swal.fire({
        icon: 'warning',
        title: 'Selecciona al menos un documento',
        text: 'Debes seleccionar boleta o factura',
      });
      return;
    }

    setIsLoading(true);
    try {
      // Enviar boleta y factura
      await reportesService.enviarEmailConBoleta(venta.id, email);

      Swal.fire({
        icon: 'success',
        title: 'Enviado correctamente',
        text: 'Documentos enviados al email',
      });

      setEmail('');
      setSendBoleta(true);
      setSendFactura(true);
      onClose();
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error al enviar',
        text: 'No se pudo enviar los documentos',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Mail className="w-6 h-6 text-white" />
            <h2 className="text-xl font-bold text-white">Enviar por Email</h2>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 p-2 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
              Email del cliente
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="cliente@example.com"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <i className="fas fa-info-circle mr-2"></i>
              Se enviarán la boleta y factura a este email
            </p>
          </div>

          {/* Detalles de la venta */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-2">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <span className="font-semibold">Cliente:</span> {venta.cliente}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <span className="font-semibold">Total:</span> S/ {Number(venta.precio_total).toFixed(2)}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <span className="font-semibold">Método:</span> {venta.metodo_pago}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 dark:bg-gray-800 px-6 py-4 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
          >
            Cancelar
          </button>
          <button
            onClick={handleSendEmail}
            disabled={isLoading}
            className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Mail className="w-4 h-4" />
                Enviar
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
