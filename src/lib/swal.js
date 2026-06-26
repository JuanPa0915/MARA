import Swal from 'sweetalert2'

const MaraSwal = Swal.mixin({
  background: '#fff8f3',
  color: '#1f1b14',
  confirmButtonColor: '#695946',
  cancelButtonColor: '#ba1a1a',
  confirmButtonText: 'Aceptar',
  cancelButtonText: 'Cancelar',
  buttonsStyling: true,
  customClass: {
    title: 'font-headline-md text-on-surface',
    htmlContainer: 'font-body-md text-on-surface-variant',
    confirmButton: 'btn-primary px-6 py-2 text-white bg-primary border-primary',
    cancelButton: 'btn-primary px-6 py-2 text-error border-error hover:bg-error hover:text-white',
    popup: 'rounded-none shadow-xl',
    icon: 'border-0',
  },
})

export function showSuccess(title, message) {
  return MaraSwal.fire({
    icon: 'success',
    iconColor: '#695946',
    title,
    text: message,
    timer: 4000,
    timerProgressBar: true,
  })
}

export function showError(title, message) {
  return MaraSwal.fire({
    icon: 'error',
    iconColor: '#ba1a1a',
    title,
    text: message,
  })
}

export function showWarning(title, message) {
  return MaraSwal.fire({
    icon: 'warning',
    iconColor: '#d5c4b1',
    title,
    text: message,
  })
}

export function showInfo(title, message) {
  return MaraSwal.fire({
    icon: 'info',
    iconColor: '#695946',
    title,
    text: message,
  })
}
