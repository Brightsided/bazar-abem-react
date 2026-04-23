import { useEffect, useMemo, useState } from 'react';
import { X, Printer, Download, Loader, FileText } from 'lucide-react';
import { VentaDetallada } from '@/types';
import { reportesService } from '@/services/reportesService';
import PdfViewer from '@/components/pdf/PdfViewer';

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

    const win = window.open(pdfUrl, '_blank');
    if (!win) {
      setIsGenerating(false);
      return;
    }

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

    win.addEventListener('beforeunload', () => window.clearTimeout(timer));
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-surface-900 rounded-2xl shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col border border-surface-200 dark:border-surface-700">
        {/* Header */}
        <div className="bg-gradient-to-r from-mint-600 to-mint-500 p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileText className="w-6 h-6 text-white" />
            <h2 className="text-lg font-bold text-white">Vista Previa - Boleta</h2>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white hover:bg-white/20 p-2 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content - PDF Viewer */}
        <div className="flex-1 overflow-hidden bg-surface-100 dark:bg-surface-950">
          {isLoadingPdf ? (
            <div className="h-full flex items-center justify-center">
              <div className="flex items-center gap-3 text-surface-600 dark:text-surface-400">
                <Loader className="w-5 h-5 animate-spin text-mint-500" />
                <span>Cargando boleta...</span>
              </div>
            </div>
          ) : pdfUrl ? (
            <PdfViewer fileUrl={pdfUrl} />
          ) : (
            <div className="h-full flex items-center justify-center text-surface-500">
              No se pudo cargar la boleta.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-surface-50 dark:bg-surface-800 px-5 py-4 flex gap-3 border-t border-surface-200 dark:border-surface-700">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 border border-surface-300 dark:border-surface-600 rounded-xl text-surface-600 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-700 transition font-medium text-sm"
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
            className="flex-1 px-4 py-2.5 bg-mint-500/10 text-mint-700 dark:text-mint-400 border border-mint-200 dark:border-mint-800 rounded-xl hover:bg-mint-500/20 transition disabled:opacity-50 flex items-center justify-center gap-2 font-medium text-sm"
          >
            <Download className="w-4 h-4" />
            Descargar
          </button>

          <button
            onClick={handlePrint}
            disabled={isGenerating}
            className="flex-1 px-4 py-2.5 bg-mint-600 text-white rounded-xl hover:bg-mint-700 shadow-glow-mint hover:shadow-glow-mint-lg transition disabled:opacity-50 flex items-center justify-center gap-2 font-medium text-sm"
          >
            <Printer className="w-4 h-4" />
            {isGenerating ? 'Preparando...' : 'Imprimir'}
          </button>
        </div>
      </div>
    </div>
  );
};
