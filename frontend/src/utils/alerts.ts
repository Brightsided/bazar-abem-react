import Swal from 'sweetalert2';
import { toast } from 'sonner';

// ⚠️ NOTA
// Este proyecto usaba SweetAlert2. Se mantiene para confirmaciones/modales (showConfirm/showLoading)
// y se migra a Sonner para notificaciones rápidas (success/error/info).

export const showAlert = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
  if (type === 'success') return showSuccess(message);
  if (type === 'error') return showError(message);

  if (type === 'warning') {
    toast.warning('Advertencia', { description: message });
    return;
  }

  toast(message);
};

export const showSuccess = (message: string) => {
  toast.success('¡Éxito!', { description: message });
};

export const showError = (message: string) => {
  toast.error('Error', { description: message });
};

export const showConfirm = async (message: string): Promise<boolean> => {
  const result = await Swal.fire({
    icon: 'question',
    title: '¿Estás seguro?',
    text: message,
    showCancelButton: true,
    confirmButtonColor: '#10b981',
    cancelButtonColor: '#ef4444',
    confirmButtonText: 'Sí, continuar',
    cancelButtonText: 'Cancelar',
  });
  return result.isConfirmed;
};

export const showLoading = (message: string = 'Cargando...') => {
  Swal.fire({
    title: message,
    allowOutsideClick: false,
    didOpen: () => {
      Swal.showLoading();
    },
  });
};

export const closeLoading = () => {
  Swal.close();
};
