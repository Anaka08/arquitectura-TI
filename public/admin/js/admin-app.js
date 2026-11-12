// =============================================
// SaludDigital - Portal Administrativo (SPA)
// =============================================

const AdminApp = {
    currentView: 'dashboard',
    user: null,

    // Menu items per role
    menus: {
        medico: [
            { id: 'dashboard', icon: '📊', label: 'Dashboard' },
            { id: 'patients', icon: '👥', label: 'Pacientes' },
            { id: 'appointments', icon: '📅', label: 'Citas' },
            { id: 'records', icon: '📋', label: 'Historia Clínica' },
            { id: 'lab', icon: '🔬', label: 'Laboratorio' },
            { id: 'prescriptions', icon: '💊', label: 'Prescripciones' },
        ],
        enfermeria: [
            { id: 'dashboard', icon: '📊', label: 'Dashboard' },
            { id: 'patients', icon: '👥', label: 'Pacientes' },
            { id: 'appointments', icon: '📅', label: 'Citas del Día' },
        ],
        laboratorio: [
            { id: 'dashboard', icon: '📊', label: 'Dashboard' },
            { id: 'lab', icon: '🔬', label: 'Órdenes de Lab' },
        ],
        farmacia: [
            { id: 'dashboard', icon: '📊', label: 'Dashboard' },
            { id: 'pharmacy', icon: '💊', label: 'Prescripciones' },
            { id: 'medications', icon: '📦', label: 'Inventario' },
        ],
        facturacion: [
            { id: 'dashboard', icon: '📊', label: 'Dashboard' },
            { id: 'billing', icon: '💳', label: 'Facturación' },
        ],
        gerencia: [
            { id: 'dashboard', icon: '📊', label: 'Dashboard' },
            { id: 'reports', icon: '📈', label: 'Reportes' },
            { id: 'patients', icon: '👥', label: 'Pacientes' },
        ],
        admin_ti: [
            { id: 'dashboard', icon: '📊', label: 'Dashboard' },
            { id: 'users', icon: '👥', label: 'Usuarios' },
            { id: 'patients', icon: '🏥', label: 'Pacientes' },
            { id: 'appointments', icon: '📅', label: 'Citas' },
            { id: 'lab', icon: '🔬', label: 'Laboratorio' },
            { id: 'pharmacy', icon: '💊', label: 'Farmacia' },
            { id: 'billing', icon: '💳', label: 'Facturación' },
            { id: 'reports', icon: '📈', label: 'Reportes' },
            { id: 'audit', icon: '🔒', label: 'Auditoría' },
        ],
    },

    init() {
        this.user = api.getUser();
        const adminRoles = ['medico', 'enfermeria', 'laboratorio', 'farmacia', 'facturacion', 'gerencia', 'admin_ti'];
        if (!this.user || !adminRoles.includes(this.user.role)) {
            this.renderAuth();
        } else {
            this.renderApp();
        }
    },

    // ====== AUTH ======
    renderAuth() {
        const app = document.getElementById('app');
        app.innerHTML = `
            <div class="admin-auth-page">
                <div class="admin-auth-container">
                    <div class="admin-auth-logo">
                        <h1>🏥 SaludDigital</h1>
                        <p>Portal Administrativo</p>
                    </div>
                    <div class="auth-card">
                        <h3 style="text-align: center; margin-bottom: 1.5rem; color: var(--text-primary);">Iniciar Sesión</h3>
                        <form onsubmit="AdminApp.handleLogin(event)">
                            <div class="form-group">
                                <label class="form-label">Correo electrónico</label>
                                <input type="email" class="form-input" id="adminEmail" placeholder="usuario@saluddigital.com" required>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Contraseña</label>
                                <input type="password" class="form-input" id="adminPassword" placeholder="••••••" required>
                            </div>
                            <button type="submit" class="btn btn-primary btn-lg w-full" id="adminLoginBtn" style="background: linear-gradient(135deg, var(--teal-700), var(--primary-700));">Ingresar</button>
                        </form>
                    </div>
                    <div class="auth-back">
                        <a href="/">← Volver al inicio</a>
                    </div>
                </div>
            </div>
        `;
    },

    async handleLogin(e) {
        e.preventDefault();
        const btn = document.getElementById('adminLoginBtn');
        btn.disabled = true;
        btn.innerHTML = '<div class="spinner spinner-sm"></div> Ingresando...';
        try {
            const result = await api.login(
                document.getElementById('adminEmail').value,
                document.getElementById('adminPassword').value
            );
            if (result.user.role === 'paciente') {
                api.logout();
                UI.error('Este portal es para personal administrativo. Use el portal de pacientes.');
                btn.disabled = false;
                btn.textContent = 'Ingresar';
                return;
            }
            this.user = result.user;
            UI.success('¡Bienvenido/a, ' + result.user.first_name + '!');
            this.renderApp();
        } catch (err) {
            UI.error(err.message);
            btn.disabled = false;
            btn.textContent = 'Ingresar';
        }
    },

    // ====== APP LAYOUT ======
    renderApp() {
        const menu = this.menus[this.user.role] || this.menus.admin_ti;
        const app = document.getElementById('app');
        app.innerHTML = `
            <div class="admin-layout">
                <aside class="admin-sidebar">
                    <div class="sidebar-logo">
                        <div class="sidebar-logo-icon">🏥</div>
                        <span class="sidebar-logo-text">SaludDigital</span>
                    </div>
                    <div class="sidebar-role">
                        ${UI.avatar(this.user.first_name, this.user.last_name, 'avatar-sm')}
                        <div>
                            <div class="sidebar-role-name">${this.user.first_name} ${this.user.last_name}</div>
                            <div class="sidebar-role-label">${UI.roleLabel(this.user.role)}</div>
                        </div>
                    </div>
                    <div class="sidebar-section">
                        <div class="sidebar-section-title">Menú Principal</div>
                        ${menu.map(m => `
                            <button class="sidebar-item ${m.id === 'dashboard' ? 'active' : ''}" data-view="${m.id}" onclick="AdminApp.navigate('${m.id}')">
                                <span class="si-icon">${m.icon}</span>
                                <span>${m.label}</span>
                            </button>
                        `).join('')}
                    </div>
                    <div class="sidebar-logout">
                        <button class="sidebar-item" onclick="AdminApp.logout()" style="color: #f87171;">
                            <span class="si-icon">🚪</span>
                            <span>Cerrar Sesión</span>
                        </button>
                    </div>
                </aside>
                <div class="admin-main">
                    <header class="admin-header">
                        <span class="admin-header-title" id="headerTitle">Dashboard</span>
                        <div style="display: flex; align-items: center; gap: 1rem;">
                            <span class="text-sm text-muted">${UI.roleLabel(this.user.role)}</span>
                            ${UI.avatar(this.user.first_name, this.user.last_name, 'avatar-sm')}
                        </div>
                    </header>
                    <div class="admin-content" id="adminContent"></div>
                </div>
            </div>
        `;
        this.navigate('dashboard');
    },

    navigate(view) {
        this.currentView = view;
        document.querySelectorAll('.sidebar-item[data-view]').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.view === view);
        });
        const titles = {
            dashboard: 'Dashboard', patients: 'Pacientes', appointments: 'Citas',
            records: 'Historia Clínica', lab: 'Laboratorio', prescriptions: 'Prescripciones',
            pharmacy: 'Farmacia', medications: 'Inventario', billing: 'Facturación',
            reports: 'Reportes', users: 'Gestión de Usuarios', audit: 'Auditoría'
        };
        document.getElementById('headerTitle').textContent = titles[view] || view;
        const content = document.getElementById('adminContent');
        UI.showLoading(content);

        switch (view) {
            case 'dashboard': this.loadDashboard(); break;
            case 'patients': this.loadPatients(); break;
            case 'appointments': this.loadAppointments(); break;
            case 'records': this.loadRecordsSearch(); break;
            case 'lab': this.loadLab(); break;
            case 'prescriptions': this.loadPrescriptions(); break;
            case 'pharmacy': this.loadPharmacy(); break;
            case 'medications': this.loadMedications(); break;
            case 'billing': this.loadBilling(); break;
            case 'reports': this.loadReports(); break;
            case 'users': this.loadUsers(); break;
            case 'audit': this.loadAudit(); break;
        }
    },

    // ====== DASHBOARD ======
    async loadDashboard() {
        const c = document.getElementById('adminContent');
        try {
            const stats = await api.getStats();
            c.innerHTML = `
                <div class="animate-fade-in">
                    <div class="admin-stats-grid stagger">
                        <div class="stat-card primary"><div class="stat-icon">👥</div><div class="stat-value">${stats.total_patients}</div><div class="stat-label">Pacientes Totales</div></div>
                        <div class="stat-card teal"><div class="stat-icon">📅</div><div class="stat-value">${stats.today_appointments}</div><div class="stat-label">Citas Hoy</div></div>
                        <div class="stat-card success"><div class="stat-icon">💰</div><div class="stat-value">${UI.formatCurrency(stats.month_revenue)}</div><div class="stat-label">Ingresos del Mes</div></div>
                        <div class="stat-card warning"><div class="stat-icon">🔬</div><div class="stat-value">${stats.pending_labs}</div><div class="stat-label">Lab Pendientes</div></div>
                        <div class="stat-card indigo"><div class="stat-icon">💊</div><div class="stat-value">${stats.active_prescriptions}</div><div class="stat-label">Prescripciones Activas</div></div>
                        <div class="stat-card danger"><div class="stat-icon">📦</div><div class="stat-value">${stats.low_stock_medications}</div><div class="stat-label">Stock Bajo</div></div>
                    </div>
                    <div class="admin-grid-2" id="dashCharts">
                        <div class="chart-container"><div class="chart-title">Citas esta semana</div><div id="chartWeek" style="flex:1; display:flex; align-items:center; justify-content:center;"><p class="text-muted">Citas de la semana: ${stats.week_appointments}</p></div></div>
                        <div class="chart-container"><div class="chart-title">Resumen Financiero</div>
                            <div class="donut-list">
                                <div class="donut-item"><div class="donut-color" style="background: var(--success-500);"></div><span class="donut-label">Ingresos del mes</span><span class="donut-value">${UI.formatCurrency(stats.month_revenue)}</span></div>
                                <div class="donut-item"><div class="donut-color" style="background: var(--warning-500);"></div><span class="donut-label">Pendiente de cobro</span><span class="donut-value">${UI.formatCurrency(stats.pending_invoices.total)}</span></div>
                                <div class="donut-item"><div class="donut-color" style="background: var(--danger-500);"></div><span class="donut-label">Citas canceladas (mes)</span><span class="donut-value">${stats.cancelled_month}</span></div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        } catch (err) {
            c.innerHTML = `<div class="card"><div class="card-body"><h3>Dashboard</h3><p class="text-muted mt-md">Conecte la base de datos para ver estadísticas en tiempo real.</p></div></div>`;
        }
    },

    // ====== PATIENTS ======
    async loadPatients() {
        const c = document.getElementById('adminContent');
        try {
            const data = await api.getPatients('');
            const patients = data.patients || [];
            c.innerHTML = `
                <div class="animate-fade-in">
                    <div class="filter-bar">
                        <input type="text" class="form-input" placeholder="🔍 Buscar paciente..." id="patientSearch" oninput="AdminApp.searchPatients()">
                        <div style="display:flex; align-items:center; gap:1rem;">
                            <span class="text-sm text-muted">${data.total || 0} pacientes</span>
                            <button class="btn btn-primary btn-sm" onclick="AdminApp.showNewPatientForm()">+ Nuevo Paciente</button>
                        </div>
                    </div>
                    <div class="table-container">
                        <table class="data-table">
                            <thead><tr><th>Paciente</th><th>Documento</th><th>Teléfono</th><th>Género</th><th>Tipo Sangre</th><th>Registro</th><th>Acciones</th></tr></thead>
                            <tbody id="patientsTable">
                                ${patients.map(p => `
                                    <tr>
                                        <td><div style="display:flex; align-items:center; gap:10px;">${UI.avatar(p.first_name, p.last_name, 'avatar-sm')}<div><strong>${p.first_name} ${p.last_name}</strong><br><span class="text-xs text-muted">${p.email}</span></div></div></td>
                                        <td>${p.document_id}</td>
                                        <td>${p.phone || '—'}</td>
                                        <td>${p.gender || '—'}</td>
                                        <td>${p.blood_type || '—'}</td>
                                        <td>${UI.formatDate(p.created_at)}</td>
                                        <td><button class="btn btn-sm btn-secondary" onclick="AdminApp.viewPatient(${p.id})">Ver</button></td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                    ${patients.length === 0 ? '<div class="empty-state mt-lg"><div class="empty-icon">👥</div><div class="empty-title">Sin pacientes</div></div>' : ''}
                </div>
            `;
        } catch (err) { UI.error('Error: ' + err.message); }
    },

    async searchPatients() {
        const search = document.getElementById('patientSearch').value;
        if (search.length < 2 && search.length > 0) return;
        try {
            const data = await api.getPatients(`search=${encodeURIComponent(search)}`);
            const tbody = document.getElementById('patientsTable');
            tbody.innerHTML = (data.patients || []).map(p => `
                <tr>
                    <td><div style="display:flex; align-items:center; gap:10px;">${UI.avatar(p.first_name, p.last_name, 'avatar-sm')}<div><strong>${p.first_name} ${p.last_name}</strong><br><span class="text-xs text-muted">${p.email}</span></div></div></td>
                    <td>${p.document_id}</td><td>${p.phone || '—'}</td><td>${p.gender || '—'}</td><td>${p.blood_type || '—'}</td><td>${UI.formatDate(p.created_at)}</td>
                    <td><button class="btn btn-sm btn-secondary" onclick="AdminApp.viewPatient(${p.id})">Ver</button></td>
                </tr>
            `).join('');
        } catch (err) { /* ignore search errors */ }
    },

    async viewPatient(id) {
        try {
            const [patient, records] = await Promise.all([
                api.getPatient(id),
                api.getRecords(id).catch(() => [])
            ]);
            const content = `
                <div style="display:flex; align-items:center; gap:1rem; margin-bottom:1.5rem;">
                    ${UI.avatar(patient.first_name, patient.last_name, 'avatar-lg')}
                    <div>
                        <h3>${patient.first_name} ${patient.last_name}</h3>
                        <p class="text-sm text-muted">${patient.email} · Doc: ${patient.document_id}</p>
                    </div>
                </div>
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.5rem; margin-bottom:1rem;">
                    <div class="detail-row"><span class="detail-label">Teléfono</span><span class="detail-value">${patient.phone || '—'}</span></div>
                    <div class="detail-row"><span class="detail-label">Género</span><span class="detail-value">${patient.gender || '—'}</span></div>
                    <div class="detail-row"><span class="detail-label">Nacimiento</span><span class="detail-value">${UI.formatDate(patient.birth_date)}</span></div>
                    <div class="detail-row"><span class="detail-label">Sangre</span><span class="detail-value">${patient.blood_type || '—'}</span></div>
                    <div class="detail-row"><span class="detail-label">Alergias</span><span class="detail-value">${patient.allergies || 'Ninguna'}</span></div>
                    <div class="detail-row"><span class="detail-label">Dirección</span><span class="detail-value">${patient.address || '—'}</span></div>
                </div>
                <h4 style="margin-top:1rem;">Historial Clínico (${records.length} registros)</h4>
                ${records.length === 0 ? '<p class="text-sm text-muted mt-sm">Sin registros clínicos.</p>' :
                records.slice(0, 5).map(r => `
                    <div style="padding:0.75rem; border:1px solid var(--border-color); border-radius:var(--radius-md); margin-top:0.5rem;">
                        <div style="display:flex; justify-content:space-between;"><strong>${r.diagnosis || 'Consulta'}</strong><span class="text-xs text-muted">${UI.formatDate(r.created_at)}</span></div>
                        ${r.symptoms ? `<p class="text-sm text-muted">Síntomas: ${r.symptoms}</p>` : ''}
                        ${r.treatment ? `<p class="text-sm">Tratamiento: ${r.treatment}</p>` : ''}
                    </div>
                `).join('')}
            `;
            UI.showModal(`Paciente: ${patient.first_name} ${patient.last_name}`, content);
        } catch (err) { UI.error(err.message); }
    },

    showNewPatientForm() {
        const content = `
            <form onsubmit="AdminApp.createPatient(event)">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem;">
                    <div class="form-group">
                        <label class="form-label">Nombre(s) *</label>
                        <input type="text" class="form-input" id="patFirstName" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Apellidos *</label>
                        <input type="text" class="form-input" id="patLastName" required>
                    </div>
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem;">
                    <div class="form-group">
                        <label class="form-label">Cédula / Documento *</label>
                        <input type="text" class="form-input" id="patDoc" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Correo Electrónico *</label>
                        <input type="email" class="form-input" id="patEmail" required>
                    </div>
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem;">
                    <div class="form-group">
                        <label class="form-label">Teléfono</label>
                        <input type="text" class="form-input" id="patPhone">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Fecha de Nacimiento</label>
                        <input type="date" class="form-input" id="patBirth">
                    </div>
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem;">
                    <div class="form-group">
                        <label class="form-label">Género</label>
                        <select class="form-select" id="patGender">
                            <option value="">Seleccione...</option>
                            <option value="Masculino">Masculino</option>
                            <option value="Femenino">Femenino</option>
                            <option value="Otro">Otro</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Tipo de Sangre</label>
                        <select class="form-select" id="patBlood">
                            <option value="">Seleccione...</option>
                            <option value="O+">O+</option>
                            <option value="O-">O-</option>
                            <option value="A+">A+</option>
                            <option value="A-">A-</option>
                            <option value="B+">B+</option>
                            <option value="B-">B-</option>
                            <option value="AB+">AB+</option>
                            <option value="AB-">AB-</option>
                        </select>
                    </div>
                </div>
                <div class="form-group">
                    <label class="form-label">Dirección</label>
                    <input type="text" class="form-input" id="patAddress">
                </div>
                <div class="form-group">
                    <label class="form-label">Alergias</label>
                    <input type="text" class="form-input" id="patAllergies" placeholder="Ej: Penicilina, polen, ninguna...">
                </div>
                <button type="submit" class="btn btn-primary w-full mt-md">Registrar Paciente</button>
            </form>
        `;
        UI.showModal('Nuevo Paciente', content);
    },

    async createPatient(e) {
        e.preventDefault();
        try {
            await api.createPatient({
                first_name: document.getElementById('patFirstName').value,
                last_name: document.getElementById('patLastName').value,
                document_id: document.getElementById('patDoc').value,
                email: document.getElementById('patEmail').value,
                phone: document.getElementById('patPhone').value,
                birth_date: document.getElementById('patBirth').value || null,
                gender: document.getElementById('patGender').value || null,
                blood_type: document.getElementById('patBlood').value || null,
                address: document.getElementById('patAddress').value || null,
                allergies: document.getElementById('patAllergies').value || null
            });
            UI.closeModal();
            UI.success('Paciente registrado con éxito');
            this.loadPatients();
        } catch (err) {
            UI.error(err.message);
        }
    },

    // ====== APPOINTMENTS ======
    async loadAppointments() {
        const c = document.getElementById('adminContent');
        try {
            const today = new Date().toISOString().split('T')[0];
            const data = await api.getAppointments('');
            const appts = data.appointments || [];
            c.innerHTML = `
                <div class="animate-fade-in">
                    <div class="filter-bar">
                        <select class="form-select" onchange="AdminApp.filterAppointments(this.value)">
                            <option value="">Todos los estados</option>
                            <option value="programada">Programadas</option>
                            <option value="completada">Completadas</option>
                            <option value="cancelada">Canceladas</option>
                        </select>
                        <div style="display:flex; align-items:center; gap:1rem;">
                            <span class="text-sm text-muted">${appts.length} citas</span>
                            <button class="btn btn-primary btn-sm" onclick="AdminApp.showNewAppointmentForm()">+ Agendar Cita</button>
                        </div>
                    </div>
                    <div class="table-container">
                        <table class="data-table">
                            <thead><tr><th>Fecha/Hora</th><th>Paciente</th><th>Médico</th><th>Especialidad</th><th>Motivo</th><th>Estado</th><th>Acciones</th></tr></thead>
                            <tbody id="apptsTable">
                                ${appts.map(a => `
                                    <tr>
                                        <td><strong>${UI.formatDateTime(a.date_time)}</strong></td>
                                        <td>${a.patient_first_name} ${a.patient_last_name}</td>
                                        <td>Dr/a. ${a.doctor_first_name} ${a.doctor_last_name}</td>
                                        <td>${a.specialty_name || '—'}</td>
                                        <td class="text-sm">${a.reason || '—'}</td>
                                        <td>${UI.statusBadge(a.status)}</td>
                                        <td>
                                            ${a.status === 'programada' ? `
                                                <button class="btn btn-sm btn-success" onclick="AdminApp.updateApptStatus(${a.id}, 'completada')">✓</button>
                                                <button class="btn btn-sm btn-danger" onclick="AdminApp.updateApptStatus(${a.id}, 'cancelada')">✕</button>
                                            ` : ''}
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            `;
        } catch (err) { UI.error('Error: ' + err.message); }
    },

    async filterAppointments(status) {
        try {
            const data = await api.getAppointments(status ? `status=${status}` : '');
            const appts = data.appointments || [];
            document.getElementById('apptsTable').innerHTML = appts.map(a => `
                <tr>
                    <td><strong>${UI.formatDateTime(a.date_time)}</strong></td>
                    <td>${a.patient_first_name} ${a.patient_last_name}</td>
                    <td>Dr/a. ${a.doctor_first_name} ${a.doctor_last_name}</td>
                    <td>${a.specialty_name || '—'}</td>
                    <td class="text-sm">${a.reason || '—'}</td>
                    <td>${UI.statusBadge(a.status)}</td>
                    <td>${a.status === 'programada' ? `<button class="btn btn-sm btn-success" onclick="AdminApp.updateApptStatus(${a.id}, 'completada')">✓</button><button class="btn btn-sm btn-danger" onclick="AdminApp.updateApptStatus(${a.id}, 'cancelada')">✕</button>` : ''}</td>
                </tr>
            `).join('');
        } catch (err) { UI.error(err.message); }
    },

    async updateApptStatus(id, status) {
        try {
            await api.updateAppointment(id, { status });
            UI.success('Cita actualizada');
            this.loadAppointments();
        } catch (err) { UI.error(err.message); }
    },

    async showNewAppointmentForm() {
        let patientsOptions = '<option value="">Cargando pacientes...</option>';
        let doctorsOptions = '';
        try {
            const [pData, dData] = await Promise.all([
                api.getPatients(''),
                api.getDoctors()
            ]);
            patientsOptions = (pData.patients || []).map(p => `<option value="${p.id}">${p.first_name} ${p.last_name} (${p.document_id})</option>`).join('');
            
            const isDoctor = this.user.role === 'medico';
            doctorsOptions = (dData || []).map(d => `
                <option value="${d.id}" ${isDoctor && d.id === this.user.id ? 'selected' : ''}>
                    Dr/a. ${d.first_name} ${d.last_name} (${d.specialty_name || 'General'})
                </option>
            `).join('');
        } catch (e) {
            console.error(e);
        }

        const now = new Date();
        now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
        const minDateTime = now.toISOString().slice(0, 16);

        const content = `
            <form onsubmit="AdminApp.createAppointment(event)">
                <div class="form-group">
                    <label class="form-label">Paciente *</label>
                    <select class="form-select" id="apptPatientId" required>
                        <option value="">Seleccione un paciente</option>
                        ${patientsOptions}
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label">Médico Tratante *</label>
                    <select class="form-select" id="apptDoctorId" required>
                        <option value="">Seleccione un médico</option>
                        ${doctorsOptions}
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label">Fecha y Hora *</label>
                    <input type="datetime-local" class="form-input" id="apptDateTime" min="${minDateTime}" required>
                </div>
                <div class="form-group">
                    <label class="form-label">Motivo de la Cita *</label>
                    <textarea class="form-textarea" id="apptReason" rows="2" placeholder="Ej: Control general, dolor estomacal..." required></textarea>
                </div>
                <button type="submit" class="btn btn-primary w-full mt-md">Agendar Cita</button>
            </form>
        `;
        UI.showModal('Agendar Nueva Cita Médica', content);
    },

    async createAppointment(e) {
        e.preventDefault();
        try {
            await api.createAppointment({
                patient_id: parseInt(document.getElementById('apptPatientId').value),
                doctor_id: parseInt(document.getElementById('apptDoctorId').value),
                date_time: document.getElementById('apptDateTime').value,
                reason: document.getElementById('apptReason').value
            });
            UI.closeModal();
            UI.success('Cita agendada exitosamente');
            this.loadAppointments();
        } catch (err) {
            UI.error(err.message);
        }
    },

    // ====== RECORDS SEARCH ======
    async loadRecordsSearch() {
        const c = document.getElementById('adminContent');
        c.innerHTML = `
            <div class="animate-fade-in">
                <div class="card">
                    <div class="card-header"><h3 class="card-title">Buscar Paciente para Historia Clínica</h3></div>
                    <div class="card-body">
                        <div class="form-group">
                            <input type="text" class="form-input" id="recordSearch" placeholder="🔍 Buscar por nombre o documento..." oninput="AdminApp.searchForRecords()">
                        </div>
                        <div id="recordSearchResults"></div>
                    </div>
                </div>
                <div id="recordsDetail" class="mt-lg"></div>
            </div>
        `;
    },

    async searchForRecords() {
        const search = document.getElementById('recordSearch').value;
        if (search.length < 2) { document.getElementById('recordSearchResults').innerHTML = ''; return; }
        try {
            const data = await api.getPatients(`search=${encodeURIComponent(search)}`);
            document.getElementById('recordSearchResults').innerHTML = (data.patients || []).map(p => `
                <button class="btn btn-secondary w-full" style="justify-content:flex-start; gap:10px; margin-bottom:0.5rem; padding:0.75rem;"
                        onclick="AdminApp.loadPatientRecords(${p.id}, '${p.first_name} ${p.last_name}')">
                    ${UI.avatar(p.first_name, p.last_name, 'avatar-sm')}
                    <div style="text-align:left;"><strong>${p.first_name} ${p.last_name}</strong><br><span class="text-xs text-muted">${p.document_id}</span></div>
                </button>
            `).join('');
        } catch (err) { /* ignore */ }
    },

    async loadPatientRecords(patientId, name) {
        const detail = document.getElementById('recordsDetail');
        UI.showLoading(detail);
        try {
            const records = await api.getRecords(patientId);
            detail.innerHTML = `
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">Historia Clínica: ${name}</h3>
                        ${this.user.role === 'medico' || this.user.role === 'enfermeria' ? `<button class="btn btn-sm btn-primary" onclick="AdminApp.showNewRecordForm(${patientId})">+ Nuevo Registro</button>` : ''}
                    </div>
                    <div class="card-body">
                        ${records.length === 0 ? '<div class="empty-state"><div class="empty-icon">📋</div><div class="empty-title">Sin registros</div></div>' :
                        records.map(r => `
                            <div style="padding:1rem; border:1px solid var(--border-color); border-radius:var(--radius-lg); margin-bottom:0.75rem;">
                                <div style="display:flex; justify-content:space-between; margin-bottom:0.5rem;">
                                    <h4>${r.diagnosis || 'Consulta médica'}</h4>
                                    <span class="text-sm text-muted">${UI.formatDateTime(r.created_at)}</span>
                                </div>
                                <p class="text-sm text-muted">Dr/a. ${r.doctor_first_name} ${r.doctor_last_name} — ${r.specialty_name || ''}</p>
                                ${r.symptoms ? `<p class="text-sm mt-sm"><strong>Síntomas:</strong> ${r.symptoms}</p>` : ''}
                                ${r.treatment ? `<p class="text-sm"><strong>Tratamiento:</strong> ${r.treatment}</p>` : ''}
                                ${r.notes ? `<p class="text-sm"><strong>Notas:</strong> ${r.notes}</p>` : ''}
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        } catch (err) { UI.error(err.message); }
    },

    showNewRecordForm(patientId) {
        const content = `
            <form onsubmit="AdminApp.createRecord(event, ${patientId})">
                <div class="form-group"><label class="form-label">Diagnóstico</label><input type="text" class="form-input" id="recDiag" required></div>
                <div class="form-group"><label class="form-label">Síntomas</label><textarea class="form-textarea" id="recSymp" rows="2"></textarea></div>
                <div class="form-group"><label class="form-label">Tratamiento</label><textarea class="form-textarea" id="recTreat" rows="2"></textarea></div>
                <div class="form-group"><label class="form-label">Notas</label><textarea class="form-textarea" id="recNotes" rows="2"></textarea></div>
                <button type="submit" class="btn btn-primary w-full">Guardar Registro</button>
            </form>
        `;
        UI.showModal('Nuevo Registro Clínico', content);
    },

    async createRecord(e, patientId) {
        e.preventDefault();
        try {
            await api.createRecord({
                patient_id: patientId,
                diagnosis: document.getElementById('recDiag').value,
                symptoms: document.getElementById('recSymp').value,
                treatment: document.getElementById('recTreat').value,
                notes: document.getElementById('recNotes').value,
            });
            UI.closeModal();
            UI.success('Registro clínico creado');
            this.loadPatientRecords(patientId, '');
        } catch (err) { UI.error(err.message); }
    },

    // ====== LAB ======
    async loadLab() {
        const c = document.getElementById('adminContent');
        try {
            const data = await api.getLabOrders('');
            const orders = data.orders || [];
            c.innerHTML = `
                <div class="animate-fade-in">
                    <div class="filter-bar">
                        <select class="form-select" onchange="AdminApp.filterLab(this.value)"><option value="">Todos</option><option value="pendiente">Pendientes</option><option value="en_proceso">En proceso</option><option value="completado">Completados</option></select>
                        ${this.user.role === 'medico' ? `<button class="btn btn-primary btn-sm" onclick="AdminApp.showNewLabOrder()">+ Nueva Orden</button>` : ''}
                    </div>
                    <div class="table-container">
                        <table class="data-table">
                            <thead><tr><th>#</th><th>Paciente</th><th>Examen</th><th>Médico</th><th>Estado</th><th>Fecha</th><th>Acciones</th></tr></thead>
                            <tbody id="labTable">
                                ${orders.map(o => `<tr>
                                    <td>#${o.id}</td><td>${o.patient_first_name} ${o.patient_last_name}</td><td><strong>${o.test_type}</strong></td>
                                    <td>Dr/a. ${o.doctor_first_name}</td><td>${UI.statusBadge(o.status)}</td><td>${UI.formatDate(o.ordered_at)}</td>
                                    <td>${o.status !== 'completado' && (this.user.role === 'laboratorio' || this.user.role === 'admin_ti') ?
                                        `<button class="btn btn-sm btn-primary" onclick="AdminApp.showUploadResults(${o.id})">Cargar</button>` : 
                                        o.results ? `<button class="btn btn-sm btn-ghost" onclick="UI.showModal('Resultados #${o.id}', '<p>${o.results}</p>')">Ver</button>` : ''}</td>
                                </tr>`).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            `;
        } catch (err) { UI.error(err.message); }
    },

    async filterLab(status) {
        try {
            const data = await api.getLabOrders(status ? `status=${status}` : '');
            const orders = data.orders || [];
            document.getElementById('labTable').innerHTML = orders.map(o => `<tr>
                <td>#${o.id}</td><td>${o.patient_first_name} ${o.patient_last_name}</td><td><strong>${o.test_type}</strong></td>
                <td>Dr/a. ${o.doctor_first_name}</td><td>${UI.statusBadge(o.status)}</td><td>${UI.formatDate(o.ordered_at)}</td>
                <td>${o.status !== 'completado' && (this.user.role === 'laboratorio' || this.user.role === 'admin_ti') ?
                    `<button class="btn btn-sm btn-primary" onclick="AdminApp.showUploadResults(${o.id})">Cargar</button>` : ''}</td>
            </tr>`).join('');
        } catch (err) { UI.error(err.message); }
    },

    showUploadResults(orderId) {
        const content = `
            <form onsubmit="AdminApp.uploadResults(event, ${orderId})">
                <div class="form-group"><label class="form-label">Resultados</label><textarea class="form-textarea" id="labResults" rows="4" required></textarea></div>
                <div class="form-group"><label class="form-label">Notas adicionales</label><textarea class="form-textarea" id="labNotes" rows="2"></textarea></div>
                <button type="submit" class="btn btn-primary w-full">Guardar Resultados</button>
            </form>
        `;
        UI.showModal('Cargar Resultados', content);
    },

    async uploadResults(e, orderId) {
        e.preventDefault();
        try {
            await api.uploadLabResults(orderId, {
                results: document.getElementById('labResults').value,
                result_notes: document.getElementById('labNotes').value,
                status: 'completado'
            });
            UI.closeModal();
            UI.success('Resultados cargados');
            this.loadLab();
        } catch (err) { UI.error(err.message); }
    },

    async showNewLabOrder() {
        let patientsOptions = '<option value="">Cargando pacientes...</option>';
        try {
            const data = await api.getPatients('');
            patientsOptions = (data.patients || []).map(p => `<option value="${p.id}">${p.first_name} ${p.last_name} (${p.document_id})</option>`).join('');
        } catch (e) { }

        const content = `
            <form onsubmit="AdminApp.createLabOrder(event)">
                <div class="form-group"><label class="form-label">Paciente</label><select class="form-select" id="labPatientId" required><option value="">Seleccione un paciente</option>${patientsOptions}</select></div>
                <div class="form-group"><label class="form-label">Tipo de Examen</label><input type="text" class="form-input" id="labTestType" placeholder="Ej: Hemograma completo" required></div>
                <div class="form-group"><label class="form-label">Descripción</label><textarea class="form-textarea" id="labDesc" rows="2"></textarea></div>
                <button type="submit" class="btn btn-primary w-full">Crear Orden</button>
            </form>
        `;
        UI.showModal('Nueva Orden de Laboratorio', content);
    },

    async createLabOrder(e) {
        e.preventDefault();
        try {
            await api.createLabOrder({
                patient_id: document.getElementById('labPatientId').value,
                test_type: document.getElementById('labTestType').value,
                description: document.getElementById('labDesc').value,
            });
            UI.closeModal();
            UI.success('Orden de laboratorio creada');
            this.loadLab();
        } catch (err) { UI.error(err.message); }
    },

    // ====== PRESCRIPTIONS (Doctor) ======
    async loadPrescriptions() {
        const c = document.getElementById('adminContent');
        try {
            const data = await api.getPrescriptions('');
            const rxs = data.prescriptions || [];
            c.innerHTML = `
                <div class="animate-fade-in">
                    <div class="filter-bar">
                        <button class="btn btn-primary btn-sm" onclick="AdminApp.showNewPrescription()">+ Nueva Prescripción</button>
                    </div>
                    <div class="table-container">
                        <table class="data-table">
                            <thead><tr><th>Paciente</th><th>Medicamento</th><th>Dosis</th><th>Frecuencia</th><th>Días</th><th>Estado</th><th>Fecha</th></tr></thead>
                            <tbody>${rxs.map(p => `<tr>
                                <td>${p.patient_first_name} ${p.patient_last_name}</td><td><strong>${p.medication_name}</strong></td>
                                <td>${p.dosage || '—'}</td><td>${p.frequency || '—'}</td><td>${p.duration_days || '—'}</td>
                                <td>${UI.statusBadge(p.status)}</td><td>${UI.formatDate(p.prescribed_at)}</td>
                            </tr>`).join('')}</tbody>
                        </table>
                    </div>
                </div>
            `;
        } catch (err) { UI.error(err.message); }
    },

    async showNewPrescription() {
        let patientsOptions = '';
        try {
            const data = await api.getPatients('');
            patientsOptions = (data.patients || []).map(p => `<option value="${p.id}">${p.first_name} ${p.last_name} (${p.document_id})</option>`).join('');
        } catch (e) { }

        const content = `
            <form onsubmit="AdminApp.createPrescription(event)">
                <div class="form-group"><label class="form-label">Paciente</label><select class="form-select" id="rxPatientId" required><option value="">Seleccione un paciente</option>${patientsOptions}</select></div>
                <div class="form-group"><label class="form-label">Medicamento</label><input type="text" class="form-input" id="rxMed" required></div>
                <div class="form-row">
                    <div class="form-group"><label class="form-label">Dosis</label><input type="text" class="form-input" id="rxDose" placeholder="Ej: 500mg"></div>
                    <div class="form-group"><label class="form-label">Frecuencia</label><input type="text" class="form-input" id="rxFreq" placeholder="Ej: Cada 8 horas"></div>
                </div>
                <div class="form-group"><label class="form-label">Duración (días)</label><input type="number" class="form-input" id="rxDays"></div>
                <div class="form-group"><label class="form-label">Indicaciones</label><textarea class="form-textarea" id="rxInst" rows="2"></textarea></div>
                <button type="submit" class="btn btn-primary w-full">Crear Prescripción</button>
            </form>
        `;
        UI.showModal('Nueva Prescripción', content);
    },

    async createPrescription(e) {
        e.preventDefault();
        try {
            await api.createPrescription({
                patient_id: document.getElementById('rxPatientId').value,
                medication_name: document.getElementById('rxMed').value,
                dosage: document.getElementById('rxDose').value,
                frequency: document.getElementById('rxFreq').value,
                duration_days: document.getElementById('rxDays').value || null,
                instructions: document.getElementById('rxInst').value,
            });
            UI.closeModal();
            UI.success('Prescripción creada');
            this.loadPrescriptions();
        } catch (err) { UI.error(err.message); }
    },

    // ====== PHARMACY ======
    async loadPharmacy() {
        const c = document.getElementById('adminContent');
        try {
            const data = await api.getPrescriptions('status=activa');
            const rxs = data.prescriptions || [];
            c.innerHTML = `
                <div class="animate-fade-in">
                    <div class="page-header"><div><h1 style="font-size:1.25rem;">Prescripciones Pendientes</h1><p class="text-sm text-muted">${rxs.length} prescripciones activas</p></div></div>
                    <div class="table-container">
                        <table class="data-table">
                            <thead><tr><th>Paciente</th><th>Medicamento</th><th>Dosis</th><th>Frecuencia</th><th>Médico</th><th>Estado</th><th>Acción</th></tr></thead>
                            <tbody>${rxs.map(p => `<tr>
                                <td>${p.patient_first_name} ${p.patient_last_name}</td><td><strong>${p.medication_name}</strong></td>
                                <td>${p.dosage || '—'}</td><td>${p.frequency || '—'}</td>
                                <td>Dr/a. ${p.doctor_first_name}</td><td>${UI.statusBadge(p.status)}</td>
                                <td><button class="btn btn-sm btn-success" onclick="AdminApp.dispense(${p.id})">Dispensar</button></td>
                            </tr>`).join('')}</tbody>
                        </table>
                    </div>
                </div>
            `;
        } catch (err) { UI.error(err.message); }
    },

    async dispense(prescriptionId) {
        try {
            await api.dispenseMedication({ prescription_id: prescriptionId, quantity: 1 });
            UI.success('Medicamento dispensado');
            this.loadPharmacy();
        } catch (err) { UI.error(err.message); }
    },

    // ====== MEDICATIONS ======
    async loadMedications() {
        const c = document.getElementById('adminContent');
        try {
            const data = await api.getMedications('');
            const meds = data.medications || [];
            c.innerHTML = `
                <div class="animate-fade-in">
                    <div class="filter-bar">
                        <input type="text" class="form-input" placeholder="🔍 Buscar medicamento..." oninput="AdminApp.searchMeds(this.value)">
                        <span class="text-sm text-muted">${meds.length} medicamentos</span>
                    </div>
                    <div class="table-container">
                        <table class="data-table">
                            <thead><tr><th>Medicamento</th><th>Genérico</th><th>Categoría</th><th>Stock</th><th>Precio</th></tr></thead>
                            <tbody id="medsTable">${meds.map(m => `<tr>
                                <td><strong>${m.name}</strong></td><td>${m.generic_name || '—'}</td><td><span class="badge badge-neutral">${m.category || '—'}</span></td>
                                <td><span class="${m.stock < 50 ? 'badge badge-danger' : 'badge badge-success'}">${m.stock}</span></td>
                                <td>${UI.formatCurrency(m.unit_price)}</td>
                            </tr>`).join('')}</tbody>
                        </table>
                    </div>
                </div>
            `;
        } catch (err) { UI.error(err.message); }
    },

    async searchMeds(search) {
        try {
            const data = await api.getMedications(`search=${encodeURIComponent(search)}`);
            document.getElementById('medsTable').innerHTML = (data.medications || []).map(m => `<tr>
                <td><strong>${m.name}</strong></td><td>${m.generic_name || '—'}</td><td><span class="badge badge-neutral">${m.category || '—'}</span></td>
                <td><span class="${m.stock < 50 ? 'badge badge-danger' : 'badge badge-success'}">${m.stock}</span></td>
                <td>${UI.formatCurrency(m.unit_price)}</td>
            </tr>`).join('');
        } catch (err) { /* ignore */ }
    },

    // ====== BILLING ======
    async loadBilling() {
        const c = document.getElementById('adminContent');
        try {
            const data = await api.getInvoices('');
            const inv = data.invoices || [];
            c.innerHTML = `
                <div class="animate-fade-in">
                    <div class="filter-bar">
                        <select class="form-select" onchange="AdminApp.filterInvoices(this.value)"><option value="">Todas</option><option value="pendiente">Pendientes</option><option value="pagada">Pagadas</option></select>
                        <button class="btn btn-primary btn-sm" onclick="AdminApp.showNewInvoice()">+ Nueva Factura</button>
                    </div>
                    <div class="table-container">
                        <table class="data-table">
                            <thead><tr><th>#</th><th>Paciente</th><th>Monto</th><th>Estado</th><th>Fecha</th><th>Método</th><th>Acciones</th></tr></thead>
                            <tbody id="invoicesTable">${inv.map(i => `<tr>
                                <td><strong>#${i.id}</strong></td><td>${i.patient_first_name} ${i.patient_last_name}</td>
                                <td><strong>${UI.formatCurrency(i.total_amount)}</strong></td><td>${UI.statusBadge(i.status)}</td>
                                <td>${UI.formatDate(i.created_at)}</td><td>${i.payment_method || '—'}</td>
                                <td>${i.status === 'pendiente' ? `<button class="btn btn-sm btn-success" onclick="AdminApp.payInvoice(${i.id})">Cobrar</button>` : ''}</td>
                            </tr>`).join('')}</tbody>
                        </table>
                    </div>
                </div>
            `;
        } catch (err) { UI.error(err.message); }
    },

    async filterInvoices(status) {
        try {
            const data = await api.getInvoices(status ? `status=${status}` : '');
            document.getElementById('invoicesTable').innerHTML = (data.invoices || []).map(i => `<tr>
                <td><strong>#${i.id}</strong></td><td>${i.patient_first_name} ${i.patient_last_name}</td>
                <td><strong>${UI.formatCurrency(i.total_amount)}</strong></td><td>${UI.statusBadge(i.status)}</td>
                <td>${UI.formatDate(i.created_at)}</td><td>${i.payment_method || '—'}</td>
                <td>${i.status === 'pendiente' ? `<button class="btn btn-sm btn-success" onclick="AdminApp.payInvoice(${i.id})">Cobrar</button>` : ''}</td>
            </tr>`).join('');
        } catch (err) { UI.error(err.message); }
    },

    async showNewInvoice() {
        let patientsOptions = '';
        try {
            const data = await api.getPatients('');
            patientsOptions = (data.patients || []).map(p => `<option value="${p.id}">${p.first_name} ${p.last_name} (${p.document_id})</option>`).join('');
        } catch (e) { }

        const content = `
            <form onsubmit="AdminApp.createInvoice(event)">
                <div class="form-group"><label class="form-label">Paciente</label><select class="form-select" id="invPatientId" required><option value="">Seleccione un paciente</option>${patientsOptions}</select></div>
                <div class="form-group"><label class="form-label">Monto Total</label><input type="number" step="0.01" class="form-input" id="invAmount" required></div>
                <button type="submit" class="btn btn-primary w-full">Crear Factura</button>
            </form>
        `;
        UI.showModal('Nueva Factura', content);
    },

    async createInvoice(e) {
        e.preventDefault();
        try {
            await api.createInvoice({
                patient_id: document.getElementById('invPatientId').value,
                total_amount: document.getElementById('invAmount').value,
            });
            UI.closeModal();
            UI.success('Factura creada');
            this.loadBilling();
        } catch (err) { UI.error(err.message); }
    },

    async payInvoice(id) {
        try {
            await api.payInvoice(id, { payment_method: 'efectivo' });
            UI.success('Pago registrado');
            this.loadBilling();
        } catch (err) { UI.error(err.message); }
    },

    // ====== REPORTS ======
    async loadReports() {
        const c = document.getElementById('adminContent');
        try {
            const [stats, charts] = await Promise.all([api.getStats(), api.getChartData().catch(() => ({}))]);
            const specData = charts.appointments_by_specialty || [];
            const topMeds = charts.top_medications || [];
            const maxSpec = Math.max(...specData.map(s => parseInt(s.total)), 1);

            c.innerHTML = `
                <div class="animate-fade-in">
                    <div class="admin-stats-grid stagger">
                        <div class="stat-card primary"><div class="stat-icon">👥</div><div class="stat-value">${stats.total_patients}</div><div class="stat-label">Total Pacientes</div></div>
                        <div class="stat-card teal"><div class="stat-icon">📅</div><div class="stat-value">${stats.week_appointments}</div><div class="stat-label">Citas Semana</div></div>
                        <div class="stat-card success"><div class="stat-icon">💰</div><div class="stat-value">${UI.formatCurrency(stats.month_revenue)}</div><div class="stat-label">Ingresos Mes</div></div>
                        <div class="stat-card danger"><div class="stat-icon">❌</div><div class="stat-value">${stats.cancelled_month}</div><div class="stat-label">Cancelaciones Mes</div></div>
                    </div>
                    <div class="admin-grid-2">
                        <div class="chart-container">
                            <div class="chart-title">Citas por Especialidad</div>
                            <div class="donut-list">${specData.map((s, i) => {
                                const colors = ['#0891b2', '#0f766e', '#6366f1', '#d97706', '#059669', '#dc2626'];
                                return `<div class="donut-item"><div class="donut-color" style="background:${colors[i % colors.length]}"></div><span class="donut-label">${s.specialty}</span><div class="progress-bar"><div class="progress-fill" style="width:${(s.total / maxSpec * 100)}%; background:${colors[i % colors.length]}"></div></div><span class="donut-value">${s.total}</span></div>`;
                            }).join('') || '<p class="text-muted">Sin datos</p>'}</div>
                        </div>
                        <div class="chart-container">
                            <div class="chart-title">Top Medicamentos Prescritos</div>
                            <div class="donut-list">${topMeds.map((m, i) => {
                                const colors = ['#0891b2', '#0f766e', '#6366f1', '#d97706', '#059669'];
                                return `<div class="donut-item"><div class="donut-color" style="background:${colors[i % colors.length]}"></div><span class="donut-label">${m.medication_name}</span><span class="donut-value">${m.total}</span></div>`;
                            }).join('') || '<p class="text-muted">Sin datos</p>'}</div>
                        </div>
                    </div>
                </div>
            `;
        } catch (err) { c.innerHTML = '<div class="card"><div class="card-body text-muted">Conecte la BD para ver reportes.</div></div>'; }
    },

    // ====== USERS (Admin TI) ======
    async loadUsers() {
        const c = document.getElementById('adminContent');
        try {
            const data = await api.getUsers('');
            const users = data.users || [];
            c.innerHTML = `
                <div class="animate-fade-in">
                    <div class="filter-bar">
                        <input type="text" class="form-input" placeholder="🔍 Buscar..." id="userSearch" oninput="AdminApp.searchUsers()">
                        <select class="form-select" id="userRoleFilter" onchange="AdminApp.searchUsers()">
                            <option value="">Todos los roles</option>
                            <option value="paciente">Pacientes</option><option value="medico">Médicos</option>
                            <option value="enfermeria">Enfermería</option><option value="laboratorio">Laboratorio</option>
                            <option value="farmacia">Farmacia</option><option value="facturacion">Facturación</option>
                            <option value="gerencia">Gerencia</option><option value="admin_ti">Admin TI</option>
                        </select>
                        <button class="btn btn-primary btn-sm" onclick="AdminApp.showCreateUser()">+ Crear Usuario</button>
                        <span class="text-sm text-muted">${data.total || 0} usuarios</span>
                    </div>
                    <div class="table-container">
                        <table class="data-table">
                            <thead><tr><th>Usuario</th><th>Documento</th><th>Rol</th><th>Especialidad</th><th>Estado</th><th>Acciones</th></tr></thead>
                            <tbody id="usersTable">${users.map(u => `<tr>
                                <td><div style="display:flex; align-items:center; gap:10px;">${UI.avatar(u.first_name, u.last_name, 'avatar-sm')}<div><strong>${u.first_name} ${u.last_name}</strong><br><span class="text-xs text-muted">${u.email}</span></div></div></td>
                                <td>${u.document_id}</td><td><span class="badge badge-info">${UI.roleLabel(u.role)}</span></td>
                                <td>${u.specialty_name || '—'}</td>
                                <td>${u.is_active ? '<span class="badge badge-success">Activo</span>' : '<span class="badge badge-danger">Inactivo</span>'}</td>
                                <td><button class="btn btn-sm ${u.is_active ? 'btn-danger' : 'btn-success'}" onclick="AdminApp.toggleUser(${u.id})">${u.is_active ? 'Desactivar' : 'Activar'}</button></td>
                            </tr>`).join('')}</tbody>
                        </table>
                    </div>
                </div>
            `;
        } catch (err) { UI.error(err.message); }
    },

    async searchUsers() {
        const search = document.getElementById('userSearch').value;
        const role = document.getElementById('userRoleFilter').value;
        try {
            const data = await api.getUsers(`search=${encodeURIComponent(search)}&role=${role}`);
            document.getElementById('usersTable').innerHTML = (data.users || []).map(u => `<tr>
                <td><div style="display:flex; align-items:center; gap:10px;">${UI.avatar(u.first_name, u.last_name, 'avatar-sm')}<div><strong>${u.first_name} ${u.last_name}</strong><br><span class="text-xs text-muted">${u.email}</span></div></div></td>
                <td>${u.document_id}</td><td><span class="badge badge-info">${UI.roleLabel(u.role)}</span></td>
                <td>${u.specialty_name || '—'}</td><td>${u.is_active ? '<span class="badge badge-success">Activo</span>' : '<span class="badge badge-danger">Inactivo</span>'}</td>
                <td><button class="btn btn-sm ${u.is_active ? 'btn-danger' : 'btn-success'}" onclick="AdminApp.toggleUser(${u.id})">${u.is_active ? 'Desactivar' : 'Activar'}</button></td>
            </tr>`).join('');
        } catch (err) { /* ignore */ }
    },

    async toggleUser(id) {
        try {
            await api.toggleUser(id);
            UI.success('Estado de usuario actualizado');
            this.loadUsers();
        } catch (err) { UI.error(err.message); }
    },

    showCreateUser() {
        const content = `
            <form onsubmit="AdminApp.createUser(event)">
                <div class="form-row">
                    <div class="form-group"><label class="form-label">Nombre *</label><input type="text" class="form-input" id="newUserFN" required></div>
                    <div class="form-group"><label class="form-label">Apellido *</label><input type="text" class="form-input" id="newUserLN" required></div>
                </div>
                <div class="form-group"><label class="form-label">Email *</label><input type="email" class="form-input" id="newUserEmail" required></div>
                <div class="form-group"><label class="form-label">Documento *</label><input type="text" class="form-input" id="newUserDoc" required></div>
                <div class="form-group"><label class="form-label">Rol *</label>
                    <select class="form-select" id="newUserRole" required>
                        <option value="medico">Médico</option><option value="enfermeria">Enfermería</option>
                        <option value="laboratorio">Laboratorio</option><option value="farmacia">Farmacia</option>
                        <option value="facturacion">Facturación</option><option value="gerencia">Gerencia</option>
                        <option value="admin_ti">Admin TI</option>
                    </select>
                </div>
                <div class="form-group"><label class="form-label">Contraseña *</label><input type="password" class="form-input" id="newUserPass" minlength="6" required></div>
                <button type="submit" class="btn btn-primary w-full">Crear Usuario</button>
            </form>
        `;
        UI.showModal('Crear Usuario', content);
    },

    async createUser(e) {
        e.preventDefault();
        try {
            await api.createStaff({
                first_name: document.getElementById('newUserFN').value,
                last_name: document.getElementById('newUserLN').value,
                email: document.getElementById('newUserEmail').value,
                document_id: document.getElementById('newUserDoc').value,
                role: document.getElementById('newUserRole').value,
                password: document.getElementById('newUserPass').value,
            });
            UI.closeModal();
            UI.success('Usuario creado exitosamente');
            this.loadUsers();
        } catch (err) { UI.error(err.message); }
    },

    // ====== AUDIT ======
    async loadAudit() {
        const c = document.getElementById('adminContent');
        try {
            const data = await api.getAuditLogs('');
            const logs = data.logs || [];
            c.innerHTML = `
                <div class="animate-fade-in">
                    <div class="page-header"><div><h1 style="font-size:1.25rem;">Registro de Auditoría</h1><p class="text-sm text-muted">Últimas ${logs.length} acciones registradas</p></div></div>
                    <div class="table-container">
                        <table class="data-table">
                            <thead><tr><th>Fecha/Hora</th><th>Usuario</th><th>Rol</th><th>Acción</th><th>Entidad</th><th>Detalles</th></tr></thead>
                            <tbody>${logs.map(l => `<tr>
                                <td>${UI.formatDateTime(l.created_at)}</td>
                                <td>${l.first_name ? l.first_name + ' ' + l.last_name : '—'}</td>
                                <td>${l.role ? `<span class="badge badge-info">${UI.roleLabel(l.role)}</span>` : '—'}</td>
                                <td><strong>${l.action}</strong></td>
                                <td>${l.entity_type || '—'}</td>
                                <td class="text-sm text-muted">${l.details || '—'}</td>
                            </tr>`).join('')}</tbody>
                        </table>
                    </div>
                </div>
            `;
        } catch (err) { UI.error(err.message); }
    },

    logout() {
        api.logout();
        this.user = null;
        this.renderAuth();
        UI.info('Sesión cerrada');
    }
};

AdminApp.init();
