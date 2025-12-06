import { useState } from 'react';
import { X, Printer, Download } from 'lucide-react';
import { VentaDetallada } from '@/types';
import { PDFDownloadLink, PDFViewer } from '@react-pdf/renderer';
import { FacturaPDF } from '@/components/pdf/FacturaPDF';

interface FacturaPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  venta: VentaDetallada | null;
}

export const FacturaPrintModal = ({ isOpen, onClose, venta }: FacturaPrintModalProps) => {
  const [isGenerating, setIsGenerating] = useState(false);

  if (!isOpen || !venta) return null;

  const handlePrint = () => {
    setIsGenerating(true);
    setTimeout(() => {
      window.print();
      setIsGenerating(false);
    }, 500);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <i className="fas fa-file-invoice text-2xl text-white"></i>
            <h2 className="text-xl font-bold text-white">Vista Previa - Factura</h2>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 p-2 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content - PDF Viewer */}
        <div className="flex-1 overflow-hidden">
          <PDFViewer style={{ width: '100%', height: '100%' }}>
            <FacturaPDF venta={venta} />
          </PDFViewer>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 dark:bg-gray-800 px-6 py-4 flex gap-3 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
          >
            Cerrar
          </button>
          
          <PDFDownloadLink
            document={<FacturaPDF venta={venta} />}
            fileName={`factura_${venta.id}.pdf`}
            className="flex-1"
          >
            {({ loading }) => (
              <button
                disabled={loading}
                className="w-full px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:shadow-lg transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                {loading ? 'Generando...' : 'Descargar'}
              </button>
            )}
          </PDFDownloadLink>

          <button
            onClick={handlePrint}
            disabled={isGenerating}
            className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:shadow-lg transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Printer className="w-4 h-4" />
            {isGenerating ? 'Preparando...' : 'Imprimir'}
          </button>
        </div>
      </div>
    </div>
  );
};
