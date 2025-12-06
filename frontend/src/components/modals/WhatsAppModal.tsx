import { useState } from 'react';
import { X, MessageCircle, Loader } from 'lucide-react';
import { VentaDetallada } from '@/types';
import { formatCurrency, formatDate } from '@/utils/formatters';
import Swal from 'sweetalert2';

interface WhatsAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  venta: VentaDetallada | null;
}

export const WhatsAppModal = ({ isOpen, onClose, venta }: WhatsAppModalProps) => {
  const [phone, setPhone] = useState('+51');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen || !venta) return null;

  const handleSendWhatsApp = async () => {
    // Validar que el teléfono sea válido
    if (phone.length < 13 || !phone.startsWith('+51')) {
      Swal.fire({
        icon: 'warning',
        title: 'Teléfono inválido',
        text: 'Por favor ingresa un número válido con +51',
      });
      return;
    }

    setIsLoading(true);
    try {
      // Crear mensaje con los detalles de la venta
      const mensaje = `
*DETALLE DE VENTA*

*Cliente:* ${venta.cliente}
*ID Venta:* #${venta.id}
*Fecha:* ${formatDate(venta.fecha_venta)}
*Método de Pago:* ${venta.metodo_pago}

*Productos:*
${venta.productos}

*Total:* ${formatCurrency(Number(venta.precio_total))}

Gracias por su compra 🙏
      `.trim();

      // Codificar el mensaje para URL
      const mensajeCodificado = encodeURIComponent(mensaje);
      
      // Crear URL de WhatsApp
      const numeroLimpio = phone.replace(/\D/g, '');
      const urlWhatsApp = `https://wa.me/${numeroLimpio}?text=${mensajeCodificado}`;

      // Abrir WhatsApp en nueva ventana
      window.open(urlWhatsApp, '_blank');

      Swal.fire({
        icon: 'success',
        title: 'Abriendo WhatsApp',
        text: 'Se abrirá WhatsApp con el mensaje preparado',
      });

      setPhone('+51');
      onClose();
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo abrir WhatsApp',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <MessageCircle className="w-6 h-6 text-white" />
            <h2 className="text-xl font-bold text-white">Enviar por WhatsApp</h2>
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
              Número de teléfono
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => {
                let valor = e.target.value;
                // Asegurar que siempre comience con +51
                if (!valor.startsWith('+51')) {
                  valor = '+51' + valor.replace(/\D/g, '');
                }
                setPhone(valor);
              }}
              placeholder="+51987654321"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Formato: +51 seguido de 9 dígitos
            </p>
          </div>

          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <p className="text-sm text-green-800 dark:text-green-200">
              <i className="fas fa-info-circle mr-2"></i>
              Se enviará un mensaje con los detalles de la venta
            </p>
          </div>

          {/* Detalles de la venta */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-2">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <span className="font-semibold">Cliente:</span> {venta.cliente}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <span className="font-semibold">Total:</span> {formatCurrency(Number(venta.precio_total))}
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
            onClick={handleSendWhatsApp}
            disabled={isLoading}
            className="flex-1 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:shadow-lg transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                Abriendo...
              </>
            ) : (
              <>
                <MessageCircle className="w-4 h-4" />
                Enviar
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
