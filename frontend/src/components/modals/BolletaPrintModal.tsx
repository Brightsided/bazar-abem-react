import { useEffect, useMemo, useState } from 'react';
import { X, Printer, Download, Loader } from 'lucide-react';
import { VentaDetallada } from '@/types';
import { reportesService } from '@/services/reportesService';

interface BolletaPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  venta: VentaDetallada | null;
}

export const BolletaPrintModal = ({ isOpen, onClose, venta }: BolletaPrintModalProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoadingPdf, setIsLoadingPdf] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string>('');

  const filename = useMemo(() => {
    if (!venta) return 'boleta.pdf';
    return `boleta_${String(venta.id).padStart(8, '0')}.pdf`;
  }, [venta]);

  // Cargar PDF del backend para que sea 100% igual al adjunto por email
  useEffect(() => {
    let objectUrl: string | null = null;

    const load = async () => {
      if (!isOpen || !venta) return;
      setIsLoadingPdf(true);
      try {
        const blob = await reportesService.generarPDF(venta.id, 'boleta');
        objectUrl = URL.createObjectURL(blob);
        setPdfUrl(objectUrl);
      } catch (error) {
        console.error('Error loading boleta pdf:', error);
        setPdfUrl('');
      } finally {
        setIsLoadingPdf(false);
      }
    };

    load();

    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [isOpen, venta]);

  if (!isOpen || !venta) return null;

  const handlePrint = () => {
    if (!pdfUrl) return;

    setIsGenerating(true);

    // Abrir el PDF (backend) en una pestaña para imprimirlo (misma boleta exacta)
    const win = window.open(pdfUrl, '_blank');
    if (!win) {
      setIsGenerating(false);
      return;
    }

    // Esperar un poco para que cargue y disparar print
    const timer = window.setTimeout(() => {
      try {
        win.focus();
        win.print();
      } finally {
        window.setTimeout(() => {
          setIsGenerating(false);
        }, 500);
      }
    }, 800);

    // Si se cierra antes, limpiar
    win.addEventListener('beforeunload', () => window.clearTimeout(timer));
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-600 to-red-600 p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <i className="fas fa-receipt text-2xl text-white"></i>
            <h2 className="text-xl font-bold text-white">Vista Previa - Boleta</h2>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 p-2 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content - PDF Viewer (desde backend) */}
        <div className="flex-1 overflow-hidden bg-gray-100 dark:bg-gray-950">
          {isLoadingPdf ? (
            <div className="h-full flex items-center justify-center">
              <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                <Loader className="w-5 h-5 animate-spin" />
                <span>Cargando boleta...</span>
              </div>
            </div>
          ) : pdfUrl ? (
            <iframe
              title="Vista previa boleta"
              src={pdfUrl}
              className="w-full h-full"
              style={{ border: 'none' }}
            />
          ) : (
            <div className="h-full flex items-center justify-center text-gray-600 dark:text-gray-400">
              No se pudo cargar la boleta.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 dark:bg-gray-800 px-6 py-4 flex gap-3 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
          >
            Cerrar
          </button>
          
          <button
            onClick={() => {
              if (!pdfUrl) return;
              const a = document.createElement('a');
              a.href = pdfUrl;
              a.download = filename;
              document.body.appendChild(a);
              a.click();
              a.remove();
            }}
            disabled={!pdfUrl || isLoadingPdf}
            className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:shadow-lg transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" />
            Descargar
          </button>

          <button
            onClick={handlePrint}
            disabled={isGenerating}
            className="flex-1 px-4 py-2 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-lg hover:shadow-lg transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Printer className="w-4 h-4" />
            {isGenerating ? 'Preparando...' : 'Imprimir'}
          </button>
        </div>
      </div>
    </div>
  );
};
