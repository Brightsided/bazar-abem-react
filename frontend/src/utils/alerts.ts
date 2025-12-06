import Swal from 'sweetalert2';

export const showSuccess = (message: string) => {
  Swal.fire({
    icon: 'success',
    title: '¡Éxito!',
    text: message,
    confirmButtonColor: '#6366f1',
  });
};

export const showError = (message: string) => {
  Swal.fire({
    icon: 'error',
    title: 'Error',
    text: message,
    confirmButtonColor: '#ef4444',
  });
};

export const showConfirm = async (message: string): Promise<boolean> => {
  const result = await Swal.fire({
    icon: 'question',
    title: '¿Estás seguro?',
    text: message,
    showCancelButton: true,
    confirmButtonColor: '#6366f1',
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
