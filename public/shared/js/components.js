// =============================================
// SaludDigital - Componentes UI Compartidos
// =============================================

const UI = {
    // Toast notifications
    toastContainer: null,

    init() {
        if (!document.querySelector('.toast-container')) {
            this.toastContainer = document.createElement('div');
            this.toastContainer.className = 'toast-container';
            document.body.appendChild(this.toastContainer);
        } else {
            this.toastContainer = document.querySelector('.toast-container');
        }
    },

    toast(message, type = 'info', duration = 4000) {
        if (!this.toastContainer) this.init();

        const icons = {
            success: '✓',
            error: '✕',
            warning: '⚠',
            info: 'ℹ'
        };

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <span>${icons[type] || 'ℹ'}</span>
            <span>${message}</span>
            <button class="toast-close" onclick="this.parentElement.remove()">×</button>
        `;

        this.toastContainer.appendChild(toast);
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(100%)';
            toast.style.transition = 'all 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, duration);
    },

    success(msg) { this.toast(msg, 'success'); },
    error(msg) { this.toast(msg, 'error'); },
    warning(msg) { this.toast(msg, 'warning'); },
    info(msg) { this.toast(msg, 'info'); },

    // Modal
    showModal(title, content, footer = '') {
        let overlay = document.querySelector('.modal-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.className = 'modal-overlay';
            document.body.appendChild(overlay);
        }

        overlay.innerHTML = `
            <div class="modal animate-scale-in">
                <div class="modal-header">
                    <h3 class="modal-title">${title}</h3>
                    <button class="modal-close" onclick="UI.closeModal()">×</button>
                </div>
                <div class="modal-body">${content}</div>
                ${footer ? `<div class="modal-footer">${footer}</div>` : ''}
            </div>
        `;

        requestAnimationFrame(() => overlay.classList.add('active'));
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) UI.closeModal();
        });
    },

    closeModal() {
        const overlay = document.querySelector('.modal-overlay');
        if (overlay) {
            overlay.classList.remove('active');
            setTimeout(() => overlay.remove(), 250);
        }
    },

    // Confirm dialog
    confirm(title, message) {
        return new Promise((resolve) => {
            const content = `<p style="color: var(--text-secondary)">${message}</p>`;
            const footer = `
                <button class="btn btn-secondary" onclick="UI.closeModal(); window._confirmResolve(false)">Cancelar</button>
                <button class="btn btn-danger" onclick="UI.closeModal(); window._confirmResolve(true)">Confirmar</button>
            `;
            window._confirmResolve = resolve;
            this.showModal(title, content, footer);
        });
    },

    // Loading state
    showLoading(container) {
        container.innerHTML = `
            <div class="page-loader">
                <div class="spinner"></div>
                <span>Cargando...</span>
            </div>
        `;
    },

    // Empty state
    showEmpty(container, icon = '📋', title = 'Sin datos', text = 'No hay información para mostrar') {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">${icon}</div>
                <div class="empty-title">${title}</div>
                <div class="empty-text">${text}</div>
            </div>
        `;
    },

    // Format helpers
    formatDate(dateStr) {
        if (!dateStr) return '—';
        const d = new Date(dateStr);
        return d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
    },

    formatDateTime(dateStr) {
        if (!dateStr) return '—';
        const d = new Date(dateStr);
        return d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }) +
            ' ' + d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    },

    formatCurrency(amount) {
        return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'USD' }).format(amount || 0);
    },

    // Status badge
    statusBadge(status) {
        const map = {
            'programada': { class: 'badge-primary', label: 'Programada' },
            'confirmada': { class: 'badge-info', label: 'Confirmada' },
            'en_curso': { class: 'badge-warning', label: 'En curso' },
            'completada': { class: 'badge-success', label: 'Completada' },
            'cancelada': { class: 'badge-danger', label: 'Cancelada' },
            'no_asistio': { class: 'badge-neutral', label: 'No asistió' },
            'pendiente': { class: 'badge-warning', label: 'Pendiente' },
            'en_proceso': { class: 'badge-primary', label: 'En proceso' },
            'completado': { class: 'badge-success', label: 'Completado' },
            'cancelado': { class: 'badge-danger', label: 'Cancelado' },
            'activa': { class: 'badge-success', label: 'Activa' },
            'dispensada': { class: 'badge-info', label: 'Dispensada' },
            'pagada': { class: 'badge-success', label: 'Pagada' },
            'vencida': { class: 'badge-danger', label: 'Vencida' },
            'anulada': { class: 'badge-neutral', label: 'Anulada' },
        };
        const s = map[status] || { class: 'badge-neutral', label: status };
        return `<span class="badge ${s.class}">${s.label}</span>`;
    },

    // Avatar with initials
    avatar(firstName, lastName, size = '') {
        const initials = ((firstName || '?')[0] + (lastName || '?')[0]).toUpperCase();
        const colors = ['#0891b2', '#0f766e', '#6366f1', '#d97706', '#059669', '#dc2626', '#7c3aed', '#0284c7'];
        const color = colors[(firstName || '').charCodeAt(0) % colors.length];
        return `<div class="avatar ${size}" style="background: ${color}">${initials}</div>`;
    },

    // Role label
    roleLabel(role) {
        const map = {
            'paciente': 'Paciente',
            'medico': 'Médico',
            'enfermeria': 'Enfermería',
            'laboratorio': 'Laboratorio',
            'farmacia': 'Farmacia',
            'facturacion': 'Facturación',
            'gerencia': 'Gerencia',
            'admin_ti': 'Admin TI'
        };
        return map[role] || role;
    }
};

UI.init();
