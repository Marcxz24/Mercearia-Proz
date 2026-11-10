/**
 * Utilitário de Notificações e Confirmações Personalizadas com SweetAlert2
 * Estilizado com o tema Dark/Emerald do Mercearia PROZ.
 */

// Configuração padrão do SweetAlert2 adaptada ao tema do projeto
const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    background: '#0f172a', // slate-900
    color: '#f8fafc',      // slate-50
    didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer);
        toast.addEventListener('mouseleave', Swal.resumeTimer);
    }
});

/**
 * Exibe um toast temporário no canto superior direito
 * @param {'success'|'error'|'warning'|'info'} icon 
 * @param {string} title 
 */
function notificar(icon, title) {
    Toast.fire({
        icon: icon,
        title: title
    });
}

/**
 * Exibe um dialog de confirmação elegante
 * @param {string} titulo 
 * @param {string} texto 
 * @param {Function} callbackConfirmacao 
 */
function confirmarAcao(titulo, texto, callbackConfirmacao) {
    Swal.fire({
        title: titulo,
        text: texto,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#059669', // emerald-600
        cancelButtonColor: '#e11d48',  // rose-600
        confirmButtonText: 'Sim, confirmar',
        cancelButtonText: 'Cancelar',
        background: '#0f172a',         // slate-900
        color: '#f8fafc',              // slate-50
        customClass: {
            popup: 'border border-slate-800 rounded-2xl shadow-2xl'
        }
    }).then((result) => {
        if (result.isConfirmed) {
            callbackConfirmacao();
        }
    });
}