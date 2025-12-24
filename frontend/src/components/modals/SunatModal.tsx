import { useState } from 'react';
import { VentaDetallada, ComprobanteElectronico } from '@/types';
import { facturacionService } from '@/services/facturacionService';
import { formatDate, formatCurrency } from '@/utils/formatters';
import Swal from 'sweetalert2';

interface SunatModalProps {
  isOpen: boolean;
  onClose: () => void;
  venta: VentaDetallada | null;
  onSuccess?: () => void;
}

export const SunatModal = ({ isOpen, onClose, venta, onSuccess }: SunatModalProps) => {
  const [loading, setLoading] = useState(false);
  const [comprobante, setComprobante] = useState<ComprobanteElectronico | null>(null);
  const [step, setStep] = useState<'inicio' | 'procesando' | 'resultado'>('inicio');

  if (!isOpen || !venta) return null;

  const handleProcesar = async () => {
    try {
      setLoading(true);
      setStep('procesando');

      const resultado = await facturacionService.procesarComprobante(venta.id, 'FACTURA');

      if (resultado.success) {
        // Obtener detalles del comprobante
        const detalles = await facturacionService.obtenerDetalles(venta.id);
        if (detalles.success && detalles.comprobante) {
          setComprobante(detalles.comprobante);
        }

        setStep('resultado');

        Swal.fire({
          icon: 'success',
          title: '¡Éxito!',
          text: 'Comprobante enviado a SUNAT correctamente',
          confirmButtonColor: '#3b82f6',
        });

        if (onSuccess) {
          onSuccess();
        }
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: resultado.message || 'Error al procesar comprobante',
          confirmButtonColor: '#ef4444',
        });
        setStep('inicio');
      }
    } catch (error) {
      console.error('Error:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error al procesar comprobante',
        confirmButtonColor: '#ef4444',
      });
      setStep('inicio');
    } finally {
      setLoading(false);
    }
  };

  const handleDescargarXml = async () => {
    try {
      await facturacionService.descargarXml(venta.id);
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error al descargar XML',
        confirmButtonColor: '#ef4444',
      });
    }
  };

  const handleDescargarCdr = async () => {
    try {
      await facturacionService.descargarCdr(venta.id);
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error al descargar CDR',
        confirmButtonColor: '#ef4444',
      });
    }
  };

  const handleReenviar = async () => {
    try {
      setLoading(true);

      const resultado = await facturacionService.reenviarComprobante(venta.id);

      if (resultado.success) {
        const detalles = await facturacionService.obtenerDetalles(venta.id);
        if (detalles.success && detalles.comprobante) {
          setComprobante(detalles.comprobante);
        }

        Swal.fire({
          icon: 'success',
          title: '¡Éxito!',
          text: 'Comprobante reenviado correctamente',
          confirmButtonColor: '#3b82f6',
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: resultado.message || 'Error al reenviar comprobante',
          confirmButtonColor: '#ef4444',
        });
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error al reenviar comprobante',
        confirmButtonColor: '#ef4444',
      });
    } finally {
      setLoading(false);
    }
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'ACEPTADO':
        return 'bg-green-500/20 text-green-600 dark:text-green-400';
      case 'RECHAZADO':
        return 'bg-red-500/20 text-red-600 dark:text-red-400';
      case 'PENDIENTE':
        return 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400';
      case 'ENVIADO':
        return 'bg-blue-500/20 text-blue-600 dark:text-blue-400';
      default:
        return 'bg-gray-500/20 text-gray-600 dark:text-gray-400';
    }
  };

  const getEstadoIcon = (estado: string) => {
    switch (estado) {
      case 'ACEPTADO':
        return '✓';
      case 'RECHAZADO':
        return '✕';
      case 'PENDIENTE':
        return '⏳';
      case 'ENVIADO':
        return '📤';
      default:
        return '?';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <i className="fas fa-file-invoice text-2xl"></i>
            <div>
              <h2 className="text-xl font-bold">Facturación Electrónica SUNAT</h2>
              <p className="text-blue-100 text-sm">Venta #{venta.id}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 rounded-lg p-2 transition"
          >
            <i className="fas fa-times text-xl"></i>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {step === 'inicio' && (
            <div className="space-y-6">
              {/* Información de la venta */}
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 space-y-3">
                <h3 className="font-semibold text-gray-900 dark:text-white flex items-center">
                  <i className="fas fa-info-circle mr-2 text-blue-500"></i>
                  Información de la Venta
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">Cliente</p>
                    <p className="font-semibold text-gray-900 dark:text-white">{venta.cliente}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">Fecha</p>
                    <p className="font-semibold text-gray-900 dark:text-white">{formatDate(venta.fecha_venta)}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">Método de Pago</p>
                    <p className="font-semibold text-gray-900 dark:text-white">{venta.metodo_pago}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">Total</p>
                    <p className="font-semibold text-green-600 dark:text-green-400">{formatCurrency(Number(venta.precio_total))}</p>
                  </div>
                </div>
              </div>

              {/* Productos */}
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                  <i className="fas fa-box mr-2 text-blue-500"></i>
                  Productos
                </h3>
                <div className="space-y-2 text-sm">
                  {venta.detalle_productos && venta.detalle_productos.length > 0 ? (
                    venta.detalle_productos.map((prod, idx) => (
                      <div key={idx} className="flex justify-between text-gray-700 dark:text-gray-300">
                        <span>{prod.producto || prod.nombre} x{prod.cantidad}</span>
                        <span className="font-semibold">{formatCurrency(prod.precio * prod.cantidad)}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400">{venta.productos}</p>
                  )}
                </div>
              </div>

              {/* Información SUNAT */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2 flex items-center">
                  <i className="fas fa-server mr-2"></i>
                  Ambiente SUNAT BETA
                </h3>
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  Se enviará a los servidores de prueba de SUNAT. No requiere certificado digital real.
                </p>
              </div>

              {/* Botones de acción */}
              <div className="flex gap-3">
                <button
                  onClick={handleProcesar}
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-3 rounded-lg hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <i className="fas fa-spinner animate-spin"></i>
                      Procesando...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-paper-plane"></i>
                      Enviar a SUNAT
                    </>
                  )}
                </button>
                <button
                  onClick={onClose}
                  className="px-6 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white font-semibold py-3 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}

          {step === 'procesando' && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mb-4 animate-spin">
                <i className="fas fa-spinner text-2xl text-white"></i>
              </div>
              <p className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Procesando comprobante...</p>
              <p className="text-gray-600 dark:text-gray-400 text-center">
                Generando XML, firmando y enviando a SUNAT BETA
              </p>
            </div>
          )}

          {step === 'resultado' && comprobante && (
            <div className="space-y-6">
              {/* Estado */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold ${getEstadoColor(comprobante.estado)}`}>
                    {getEstadoIcon(comprobante.estado)}
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Estado del Comprobante</p>
                    <p className={`text-lg font-bold ${getEstadoColor(comprobante.estado)}`}>
                      {comprobante.estado}
                    </p>
                  </div>
                </div>
              </div>

              {/* Detalles del comprobante */}
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 space-y-3">
                <h3 className="font-semibold text-gray-900 dark:text-white">Detalles del Comprobante</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">Tipo</p>
                    <p className="font-semibold text-gray-900 dark:text-white">{comprobante.tipo}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">Serie</p>
                    <p className="font-semibold text-gray-900 dark:text-white">{comprobante.serie}-{String(comprobante.numero).padStart(8, '0')}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">Código SUNAT</p>
                    <p className="font-semibold text-gray-900 dark:text-white">{comprobante.codigoSunat || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">Intentos</p>
                    <p className="font-semibold text-gray-900 dark:text-white">{comprobante.intentosEnvio}</p>
                  </div>
                </div>

                {comprobante.mensajeSunat && (
                  <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-800">
                    <p className="text-sm text-blue-900 dark:text-blue-100">
                      <strong>Mensaje SUNAT:</strong> {comprobante.mensajeSunat}
                    </p>
                  </div>
                )}
              </div>

              {/* Botones de descarga */}
              <div className="space-y-2">
                <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Descargar Documentos</h3>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={handleDescargarXml}
                    className="bg-orange-500/20 text-orange-600 dark:text-orange-400 hover:bg-orange-500/30 font-semibold py-2 rounded-lg transition flex items-center justify-center gap-2"
                  >
                    <i className="fas fa-download"></i>
                    Descargar XML
                  </button>
                  {comprobante.cdrXml && (
                    <button
                      onClick={handleDescargarCdr}
                      className="bg-green-500/20 text-green-600 dark:text-green-400 hover:bg-green-500/30 font-semibold py-2 rounded-lg transition flex items-center justify-center gap-2"
                    >
                      <i className="fas fa-download"></i>
                      Descargar CDR
                    </button>
                  )}
                </div>
              </div>

              {/* Botones de acción */}
              <div className="flex gap-3">
                {comprobante.estado === 'RECHAZADO' && (
                  <button
                    onClick={handleReenviar}
                    disabled={loading}
                    className="flex-1 bg-yellow-500 text-white font-semibold py-3 rounded-lg hover:bg-yellow-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <i className="fas fa-spinner animate-spin"></i>
                        Reenviando...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-redo"></i>
                        Reenviar
                      </>
                    )}
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="flex-1 bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2"
                >
                  <i className="fas fa-check"></i>
                  Cerrar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
