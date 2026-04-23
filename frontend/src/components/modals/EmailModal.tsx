import { useState } from 'react';
import { X, Mail, Loader, Send } from 'lucide-react';
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
      <div className="bg-white dark:bg-surface-900 rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden border border-surface-200 dark:border-surface-700">
        {/* Header */}
        <div className="bg-gradient-to-r from-mint-600 to-mint-500 p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Mail className="w-6 h-6 text-white" />
            <h2 className="text-lg font-bold text-white">Enviar por Email</h2>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white hover:bg-white/20 p-2 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-surface-700 dark:text-surface-200 mb-2">
              Email del cliente
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="cliente@example.com"
              className="w-full px-4 py-2.5 border border-surface-300 dark:border-surface-600 rounded-xl bg-white dark:bg-surface-800 text-surface-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-mint-500 focus:border-mint-500 transition text-sm"
            />
          </div>

          <div className="bg-mint-50 dark:bg-mint-900/20 border border-mint-200 dark:border-mint-800 rounded-xl p-4">
            <p className="text-sm text-mint-800 dark:text-mint-200 flex items-start gap-2">
              <Mail className="w-4 h-4 mt-0.5 shrink-0" />
              Se enviarán la boleta y factura a este email
            </p>
          </div>

          {/* Detalles de la venta */}
          <div className="bg-surface-50 dark:bg-surface-800 rounded-xl p-4 space-y-2">
            <p className="text-sm text-surface-600 dark:text-surface-400">
              <span className="font-semibold text-surface-700 dark:text-surface-300">Cliente:</span> {venta.cliente}
            </p>
            <p className="text-sm text-surface-600 dark:text-surface-400">
              <span className="font-semibold text-surface-700 dark:text-surface-300">Total:</span> S/ {Number(venta.precio_total).toFixed(2)}
            </p>
            <p className="text-sm text-surface-600 dark:text-surface-400">
              <span className="font-semibold text-surface-700 dark:text-surface-300">Método:</span> {venta.metodo_pago}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-surface-50 dark:bg-surface-800 px-5 py-4 flex gap-3 border-t border-surface-200 dark:border-surface-700">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 border border-surface-300 dark:border-surface-600 rounded-xl text-surface-600 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-700 transition font-medium text-sm"
          >
            Cancelar
          </button>
          <button
            onClick={handleSendEmail}
            disabled={isLoading}
            className="flex-1 px-4 py-2.5 bg-mint-600 text-white rounded-xl hover:bg-mint-700 shadow-glow-mint hover:shadow-glow-mint-lg transition disabled:opacity-50 flex items-center justify-center gap-2 font-medium text-sm"
          >
            {isLoading ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Enviar
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
