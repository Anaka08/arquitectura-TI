// =============================================
// SaludDigital - Portal del Paciente (SPA)
// =============================================

const PatientApp = {
    currentView: 'dashboard',
    user: null,

    init() {
        this.user = api.getUser();
        if (!this.user || this.user.role !== 'paciente') {
            this.renderAuth();
        } else {
            this.renderApp();
        }
    },

    // ====== AUTH ======
    renderAuth() {
        const app = document.getElementById('app');
        app.innerHTML = `
            <div class="auth-page">
                <div class="auth-container">
                    <div class="auth-logo">
                        <h1>🏥 SaludDigital</h1>
                        <p>Portal del Paciente</p>
                    </div>
                    <div class="auth-card">
                        <div class="auth-tabs">
                            <button class="auth-tab active" onclick="PatientApp.showLoginTab()">Iniciar Sesión</button>
                            <button class="auth-tab" onclick="PatientApp.showRegisterTab()">Registrarse</button>
                        </div>
                        <div id="authContent">
                            ${this.loginForm()}
                        </div>
                    </div>
                    <div class="auth-back">
                        <a href="/">← Volver al inicio</a>
                    </div>
                </div>
            </div>
        `;
    },

    loginForm() {
        return `
            <form id="loginForm" onsubmit="PatientApp.handleLogin(event)">
                <div class="form-group">
                    <label class="form-label">Correo electrónico</label>
                    <input type="email" class="form-input" id="loginEmail" placeholder="tu@email.com" required>
                </div>
                <div class="form-group">
                    <label class="form-label">Contraseña</label>
                    <input type="password" class="form-input" id="loginPassword" placeholder="••••••" required>
                </div>
                <button type="submit" class="btn btn-primary btn-lg w-full" id="loginBtn">Iniciar Sesión</button>
            </form>
        `;
    },

    registerForm() {
        return `
            <form id="registerForm" onsubmit="PatientApp.handleRegister(event)">
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Nombre *</label>
                        <input type="text" class="form-input" id="regFirstName" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Apellido *</label>
                        <input type="text" class="form-input" id="regLastName" required>
                    </div>
                </div>
                <div class="form-group">
                    <label class="form-label">Correo electrónico *</label>
                    <input type="email" class="form-input" id="regEmail" required>
                </div>
                <div class="form-group">
                    <label class="form-label">Número de documento *</label>
                    <input type="text" class="form-input" id="regDocId" required>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Teléfono</label>
                        <input type="tel" class="form-input" id="regPhone">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Fecha de nacimiento</label>
                        <input type="date" class="form-input" id="regBirthDate">
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Género</label>
                        <select class="form-select" id="regGender">
                            <option value="">Seleccionar</option>
                            <option value="Masculino">Masculino</option>
                            <option value="Femenino">Femenino</option>
                            <option value="Otro">Otro</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Tipo de sangre</label>
                        <select class="form-select" id="regBloodType">
                            <option value="">Seleccionar</option>
                            <option>A+</option><option>A-</option>
                            <option>B+</option><option>B-</option>
                            <option>AB+</option><option>AB-</option>
                            <option>O+</option><option>O-</option>
                        </select>
                    </div>
                </div>
                <div class="form-group">
                    <label class="form-label">Alergias conocidas</label>
                    <textarea class="form-textarea" id="regAllergies" placeholder="Describe tus alergias si las tienes..." rows="2"></textarea>
                </div>
                <div class="form-group">
                    <label class="form-label">Contraseña * (mínimo 6 caracteres)</label>
                    <input type="password" class="form-input" id="regPassword" minlength="6" required>
                </div>
                <button type="submit" class="btn btn-primary btn-lg w-full" id="regBtn">Crear Cuenta</button>
            </form>
        `;
    },

    showLoginTab() {
        document.querySelectorAll('.auth-tab').forEach((t, i) => t.classList.toggle('active', i === 0));
        document.getElementById('authContent').innerHTML = this.loginForm();
    },

    showRegisterTab() {
        document.querySelectorAll('.auth-tab').forEach((t, i) => t.classList.toggle('active', i === 1));
        document.getElementById('authContent').innerHTML = this.registerForm();
    },

    async handleLogin(e) {
        e.preventDefault();
        const btn = document.getElementById('loginBtn');
        btn.disabled = true;
        btn.innerHTML = '<div class="spinner spinner-sm"></div> Ingresando...';
        try {
            const result = await api.login(
                document.getElementById('loginEmail').value,
                document.getElementById('loginPassword').value
            );
            if (result.user.role !== 'paciente') {
                api.logout();
                UI.error('Este portal es solo para pacientes. Use el portal administrativo.');
                btn.disabled = false;
                btn.textContent = 'Iniciar Sesión';
                return;
            }
            this.user = result.user;
            UI.success('¡Bienvenido/a, ' + result.user.first_name + '!');
            this.renderApp();
        } catch (err) {
            UI.error(err.message);
            btn.disabled = false;
            btn.textContent = 'Iniciar Sesión';
        }
    },

    async handleRegister(e) {
        e.preventDefault();
        const btn = document.getElementById('regBtn');
        btn.disabled = true;
        btn.innerHTML = '<div class="spinner spinner-sm"></div> Registrando...';
        try {
            const data = {
                email: document.getElementById('regEmail').value,
                password: document.getElementById('regPassword').value,
                first_name: document.getElementById('regFirstName').value,
                last_name: document.getElementById('regLastName').value,
                document_id: document.getElementById('regDocId').value,
                phone: document.getElementById('regPhone').value,
                birth_date: document.getElementById('regBirthDate').value || null,
                gender: document.getElementById('regGender').value,
                blood_type: document.getElementById('regBloodType').value,
                allergies: document.getElementById('regAllergies').value,
            };
            const result = await api.register(data);
            this.user = result.user;
            UI.success('¡Cuenta creada exitosamente!');
            this.renderApp();
        } catch (err) {
            UI.error(err.message);
            btn.disabled = false;
            btn.textContent = 'Crear Cuenta';
        }
    },

    // ====== APP LAYOUT ======
    renderApp() {
        const app = document.getElementById('app');
        app.innerHTML = `
            <div class="patient-layout">
                <nav class="patient-nav">
                    <a href="/" class="patient-nav-logo">
                        <div class="logo-dot">🏥</div>
                        SaludDigital
                    </a>
                    <div class="patient-nav-menu">
                        <button class="patient-nav-item active" data-view="dashboard" onclick="PatientApp.navigate('dashboard')">🏠 Inicio</button>
                        <button class="patient-nav-item" data-view="appointments" onclick="PatientApp.navigate('appointments')">📅 Mis Citas</button>
                        <button class="patient-nav-item" data-view="schedule" onclick="PatientApp.navigate('schedule')">➕ Agendar</button>
                        <button class="patient-nav-item" data-view="results" onclick="PatientApp.navigate('results')">🔬 Resultados</button>
                        <button class="patient-nav-item" data-view="medications" onclick="PatientApp.navigate('medications')">💊 Medicamentos</button>
                        <button class="patient-nav-item" data-view="billing" onclick="PatientApp.navigate('billing')">💳 Facturación</button>
                        <button class="patient-nav-item" data-view="profile" onclick="PatientApp.navigate('profile')">👤 Perfil</button>
                    </div>
                    <div class="patient-nav-right">
                        <div class="patient-user-info" onclick="PatientApp.navigate('profile')">
                            ${UI.avatar(this.user.first_name, this.user.last_name, 'avatar-sm')}
                            <div>
                                <div class="patient-user-name">${this.user.first_name}</div>
                                <div class="patient-user-role">Paciente</div>
                            </div>
                        </div>
                        <button class="btn-logout" onclick="PatientApp.logout()">Salir</button>
                    </div>
                </nav>
                <main class="patient-main" id="patientContent"></main>
                <div class="mobile-nav">
                    <button class="mobile-nav-item active" data-view="dashboard" onclick="PatientApp.navigate('dashboard')"><span class="mn-icon">🏠</span>Inicio</button>
                    <button class="mobile-nav-item" data-view="appointments" onclick="PatientApp.navigate('appointments')"><span class="mn-icon">📅</span>Citas</button>
                    <button class="mobile-nav-item" data-view="schedule" onclick="PatientApp.navigate('schedule')"><span class="mn-icon">➕</span>Agendar</button>
                    <button class="mobile-nav-item" data-view="results" onclick="PatientApp.navigate('results')"><span class="mn-icon">🔬</span>Lab</button>
                    <button class="mobile-nav-item" data-view="profile" onclick="PatientApp.navigate('profile')"><span class="mn-icon">👤</span>Perfil</button>
                </div>
            </div>
        `;
        this.navigate('dashboard');
    },

    navigate(view) {
        this.currentView = view;
        // Update nav active state
        document.querySelectorAll('.patient-nav-item, .mobile-nav-item').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.view === view);
        });
        const content = document.getElementById('patientContent');
        content.innerHTML = '<div class="page-loader"><div class="spinner"></div><span>Cargando...</span></div>';
        
        switch (view) {
            case 'dashboard': this.loadDashboard(); break;
            case 'appointments': this.loadAppointments(); break;
            case 'schedule': this.loadSchedule(); break;
            case 'results': this.loadResults(); break;
            case 'medications': this.loadMedications(); break;
            case 'billing': this.loadBilling(); break;
            case 'profile': this.loadProfile(); break;
        }
    },

    // ====== DASHBOARD ======
    async loadDashboard() {
        const content = document.getElementById('patientContent');
        try {
            const [appts, labs, meds] = await Promise.all([
                api.getAppointments('status=programada').catch(() => ({ appointments: [] })),
                api.getLabOrders('').catch(() => ({ orders: [] })),
                api.getPrescriptions('status=activa').catch(() => ({ prescriptions: [] })),
            ]);

            const upcoming = (appts.appointments || []).filter(a => new Date(a.date_time) >= new Date()).slice(0, 3);
            const pendingResults = (labs.orders || []).filter(o => o.status !== 'completado').length;
            const completedResults = (labs.orders || []).filter(o => o.status === 'completado').length;
            const activeMeds = (meds.prescriptions || []).length;

            content.innerHTML = `
                <div class="animate-fade-in">
                    <div class="welcome-banner">
                        <h2>¡Hola, ${this.user.first_name}! 👋</h2>
                        <p>Bienvenido/a a tu portal de salud digital. Aquí puedes gestionar tus citas, resultados y más.</p>
                    </div>

                    <div class="stats-grid stagger">
                        <div class="stat-card primary">
                            <div class="stat-icon">📅</div>
                            <div class="stat-value">${upcoming.length}</div>
                            <div class="stat-label">Citas Próximas</div>
                        </div>
                        <div class="stat-card warning">
                            <div class="stat-icon">⏳</div>
                            <div class="stat-value">${pendingResults}</div>
                            <div class="stat-label">Resultados Pendientes</div>
                        </div>
                        <div class="stat-card success">
                            <div class="stat-icon">✓</div>
                            <div class="stat-value">${completedResults}</div>
                            <div class="stat-label">Resultados Listos</div>
                        </div>
                        <div class="stat-card indigo">
                            <div class="stat-icon">💊</div>
                            <div class="stat-value">${activeMeds}</div>
                            <div class="stat-label">Medicamentos Activos</div>
                        </div>
                    </div>

                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem;">
                        <div class="card">
                            <div class="card-header">
                                <h3 class="card-title">Próximas Citas</h3>
                                <button class="btn btn-sm btn-primary" onclick="PatientApp.navigate('schedule')">+ Agendar</button>
                            </div>
                            <div class="card-body" id="dashUpcoming">
                                ${upcoming.length === 0 ? '<div class="empty-state"><div class="empty-icon">📅</div><div class="empty-title">Sin citas programadas</div><div class="empty-text">Agenda una cita con tu especialista</div></div>' :
                                upcoming.map(a => `
                                    <div class="appointment-card">
                                        <div class="appointment-date">
                                            <div class="day">${new Date(a.date_time).getDate()}</div>
                                            <div class="month">${new Date(a.date_time).toLocaleDateString('es', { month: 'short' })}</div>
                                        </div>
                                        <div class="appointment-info">
                                            <h4>Dr/a. ${a.doctor_first_name} ${a.doctor_last_name}</h4>
                                            <p>${a.specialty_name || 'Consulta'} · ${new Date(a.date_time).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })}</p>
                                        </div>
                                        ${UI.statusBadge(a.status)}
                                    </div>
                                `).join('')}
                            </div>
                        </div>

                        <div class="card">
                            <div class="card-header">
                                <h3 class="card-title">Acciones Rápidas</h3>
                            </div>
                            <div class="card-body" style="display: flex; flex-direction: column; gap: 0.75rem;">
                                <button class="btn btn-secondary w-full" onclick="PatientApp.navigate('schedule')" style="justify-content: flex-start; padding: 1rem;">📅 Agendar nueva cita</button>
                                <button class="btn btn-secondary w-full" onclick="PatientApp.navigate('results')" style="justify-content: flex-start; padding: 1rem;">🔬 Ver resultados de laboratorio</button>
                                <button class="btn btn-secondary w-full" onclick="PatientApp.navigate('medications')" style="justify-content: flex-start; padding: 1rem;">💊 Consultar medicamentos</button>
                                <button class="btn btn-secondary w-full" onclick="PatientApp.navigate('billing')" style="justify-content: flex-start; padding: 1rem;">💳 Ver facturación</button>
                                <button class="btn btn-secondary w-full" onclick="PatientApp.navigate('profile')" style="justify-content: flex-start; padding: 1rem;">👤 Actualizar mi perfil</button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        } catch (err) {
            content.innerHTML = `<div class="welcome-banner"><h2>¡Hola, ${this.user.first_name}! 👋</h2><p>Bienvenido/a a tu portal de salud. Usa el menú para navegar.</p></div>`;
        }
    },

    // ====== APPOINTMENTS ======
    async loadAppointments() {
        const content = document.getElementById('patientContent');
        try {
            const data = await api.getAppointments('');
            const appointments = data.appointments || [];

            content.innerHTML = `
                <div class="animate-fade-in">
                    <div class="page-header">
                        <div>
                            <h1>Mis Citas</h1>
                            <p>Historial y próximas citas médicas</p>
                        </div>
                        <button class="btn btn-primary" onclick="PatientApp.navigate('schedule')">+ Agendar Cita</button>
                    </div>
                    <div id="appointmentsList" class="stagger">
                        ${appointments.length === 0 ? '<div class="empty-state"><div class="empty-icon">📅</div><div class="empty-title">No tienes citas</div><div class="empty-text">Agenda tu primera cita con un especialista</div></div>' :
                        appointments.map(a => `
                            <div class="appointment-card">
                                <div class="appointment-date">
                                    <div class="day">${new Date(a.date_time).getDate()}</div>
                                    <div class="month">${new Date(a.date_time).toLocaleDateString('es', { month: 'short' })}</div>
                                </div>
                                <div class="appointment-info">
                                    <h4>Dr/a. ${a.doctor_first_name} ${a.doctor_last_name}</h4>
                                    <p>${a.specialty_name || 'Consulta'} · ${new Date(a.date_time).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })}${a.reason ? ' · ' + a.reason : ''}</p>
                                </div>
                                <div class="appointment-actions">
                                    ${UI.statusBadge(a.status)}
                                    ${a.status === 'programada' || a.status === 'confirmada' ? 
                                        `<button class="btn btn-sm btn-danger" onclick="PatientApp.cancelAppointment(${a.id})">Cancelar</button>` : ''}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        } catch (err) {
            UI.error('Error al cargar citas: ' + err.message);
        }
    },

    async cancelAppointment(id) {
        if (await UI.confirm('Cancelar Cita', '¿Estás seguro de que deseas cancelar esta cita?')) {
            try {
                await api.updateAppointment(id, { status: 'cancelada' });
                UI.success('Cita cancelada');
                this.loadAppointments();
            } catch (err) { UI.error(err.message); }
        }
    },

    // ====== SCHEDULE ======
    scheduleData: { step: 1, specialtyId: null, doctorId: null, date: null, time: null },

    async loadSchedule() {
        this.scheduleData = { step: 1, specialtyId: null, doctorId: null, date: null, time: null };
        const content = document.getElementById('patientContent');
        try {
            const specialties = await api.getSpecialties();
            content.innerHTML = `
                <div class="animate-fade-in">
                    <div class="page-header">
                        <div>
                            <h1>Agendar Cita</h1>
                            <p>Selecciona especialidad, médico, fecha y hora</p>
                        </div>
                    </div>
                    <div class="schedule-steps">
                        <div class="schedule-step active">1. Especialidad</div>
                        <div class="schedule-step">2. Médico</div>
                        <div class="schedule-step">3. Fecha y Hora</div>
                        <div class="schedule-step">4. Confirmar</div>
                    </div>
                    <div class="card">
                        <div class="card-body" id="scheduleContent">
                            <h3 style="margin-bottom: 1rem;">Selecciona una especialidad</h3>
                            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 0.75rem;">
                                ${specialties.map(s => `
                                    <button class="btn btn-secondary" style="padding: 1rem; justify-content: flex-start;" 
                                            onclick="PatientApp.selectSpecialty(${s.id}, '${s.name}')">
                                        🏥 ${s.name}
                                    </button>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                </div>
            `;
        } catch (err) { UI.error('Error al cargar especialidades'); }
    },

    async selectSpecialty(id, name) {
        this.scheduleData.specialtyId = id;
        this.scheduleData.specialtyName = name;
        this.updateSteps(2);
        try {
            const doctors = await api.getDoctors(id);
            const sc = document.getElementById('scheduleContent');
            sc.innerHTML = `
                <h3 style="margin-bottom: 1rem;">Selecciona un médico de ${name}</h3>
                ${doctors.length === 0 ? '<p class="text-muted">No hay médicos disponibles en esta especialidad</p>' :
                `<div style="display: grid; gap: 0.75rem;">
                    ${doctors.map(d => `
                        <button class="btn btn-secondary w-full" style="padding: 1rem; justify-content: flex-start; gap: 12px;"
                                onclick="PatientApp.selectDoctor(${d.id}, '${d.first_name} ${d.last_name}')">
                            ${UI.avatar(d.first_name, d.last_name, 'avatar-sm')}
                            <div style="text-align: left;">
                                <div style="font-weight: 700;">Dr/a. ${d.first_name} ${d.last_name}</div>
                                <div style="font-size: 0.8rem; color: var(--text-secondary);">${d.specialty_name} · ${d.consultation_duration} min</div>
                            </div>
                        </button>
                    `).join('')}
                </div>`}
                <button class="btn btn-ghost mt-md" onclick="PatientApp.loadSchedule()">← Volver</button>
            `;
        } catch (err) { UI.error('Error al cargar médicos'); }
    },

    async selectDoctor(id, name) {
        this.scheduleData.doctorId = id;
        this.scheduleData.doctorName = name;
        this.updateSteps(3);
        const sc = document.getElementById('scheduleContent');
        // Get tomorrow's date
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const minDate = tomorrow.toISOString().split('T')[0];
        
        sc.innerHTML = `
            <h3 style="margin-bottom: 1rem;">Selecciona fecha y hora con Dr/a. ${name}</h3>
            <div class="form-group">
                <label class="form-label">Fecha</label>
                <input type="date" class="form-input" id="scheduleDate" min="${minDate}" onchange="PatientApp.loadTimeSlots()">
            </div>
            <div id="timeSlotsContainer"></div>
            <button class="btn btn-ghost mt-md" onclick="PatientApp.selectSpecialty(${this.scheduleData.specialtyId}, '${this.scheduleData.specialtyName}')">← Volver</button>
        `;
    },

    async loadTimeSlots() {
        const date = document.getElementById('scheduleDate').value;
        if (!date) return;
        this.scheduleData.date = date;
        const container = document.getElementById('timeSlotsContainer');
        container.innerHTML = '<div class="page-loader" style="min-height: 100px;"><div class="spinner spinner-sm"></div></div>';
        
        try {
            const data = await api.getAvailability(this.scheduleData.doctorId, date);
            const available = data.slots.filter(s => s.available);
            container.innerHTML = `
                <label class="form-label">Horarios disponibles (${available.length})</label>
                ${available.length === 0 ? '<p class="text-muted">No hay horarios disponibles para esta fecha</p>' :
                `<div class="time-slots">
                    ${data.slots.map(s => `
                        <button class="time-slot ${s.available ? '' : 'unavailable'}" 
                                ${s.available ? `onclick="PatientApp.selectTime('${s.time}')"` : 'disabled'}>
                            ${s.time}
                        </button>
                    `).join('')}
                </div>`}
            `;
        } catch (err) { UI.error('Error al cargar horarios'); }
    },

    selectTime(time) {
        this.scheduleData.time = time;
        document.querySelectorAll('.time-slot').forEach(s => s.classList.remove('selected'));
        event.target.classList.add('selected');
        this.updateSteps(4);
        
        const sc = document.getElementById('scheduleContent');
        const dateFormatted = new Date(this.scheduleData.date + 'T00:00:00').toLocaleDateString('es', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
        
        sc.innerHTML = `
            <h3 style="margin-bottom: 1.5rem;">Confirmar Cita</h3>
            <div class="card" style="background: var(--primary-50); border-color: var(--primary-200); margin-bottom: 1rem;">
                <div style="display: grid; gap: 0.75rem;">
                    <div><strong>Especialidad:</strong> ${this.scheduleData.specialtyName}</div>
                    <div><strong>Médico:</strong> Dr/a. ${this.scheduleData.doctorName}</div>
                    <div><strong>Fecha:</strong> ${dateFormatted}</div>
                    <div><strong>Hora:</strong> ${time}</div>
                </div>
            </div>
            <div class="form-group">
                <label class="form-label">Motivo de la consulta (opcional)</label>
                <textarea class="form-textarea" id="appointmentReason" placeholder="Describe brevemente el motivo..." rows="2"></textarea>
            </div>
            <div style="display: flex; gap: 1rem;">
                <button class="btn btn-secondary" onclick="PatientApp.selectDoctor(${this.scheduleData.doctorId}, '${this.scheduleData.doctorName}')">← Volver</button>
                <button class="btn btn-primary btn-lg" style="flex:1;" onclick="PatientApp.confirmAppointment()">✓ Confirmar Cita</button>
            </div>
        `;
    },

    async confirmAppointment() {
        try {
            const dateTime = `${this.scheduleData.date}T${this.scheduleData.time}:00`;
            await api.createAppointment({
                doctor_id: this.scheduleData.doctorId,
                date_time: dateTime,
                reason: document.getElementById('appointmentReason')?.value || ''
            });
            UI.success('¡Cita agendada exitosamente!');
            this.navigate('appointments');
        } catch (err) { UI.error(err.message); }
    },

    updateSteps(step) {
        document.querySelectorAll('.schedule-step').forEach((s, i) => {
            s.classList.remove('active', 'done');
            if (i + 1 < step) s.classList.add('done');
            if (i + 1 === step) s.classList.add('active');
        });
    },

    // ====== RESULTS ======
    async loadResults() {
        const content = document.getElementById('patientContent');
        try {
            const data = await api.getLabOrders('');
            const orders = data.orders || [];
            content.innerHTML = `
                <div class="animate-fade-in">
                    <div class="page-header">
                        <div><h1>Resultados de Laboratorio</h1><p>Consulta tus exámenes y resultados</p></div>
                    </div>
                    <div class="stagger">
                        ${orders.length === 0 ? '<div class="empty-state"><div class="empty-icon">🔬</div><div class="empty-title">Sin resultados</div><div class="empty-text">Aún no tienes órdenes de laboratorio</div></div>' :
                        orders.map(o => `
                            <div class="result-card">
                                <div class="result-header">
                                    <div>
                                        <h4>${o.test_type}</h4>
                                        <p class="text-sm text-muted">Solicitado por Dr/a. ${o.doctor_first_name} ${o.doctor_last_name} · ${UI.formatDate(o.ordered_at)}</p>
                                    </div>
                                    ${UI.statusBadge(o.status)}
                                </div>
                                ${o.results ? `<div class="result-detail"><strong>Resultados:</strong> ${o.results}</div>` : ''}
                                ${o.result_notes ? `<div class="result-detail mt-sm"><strong>Notas:</strong> ${o.result_notes}</div>` : ''}
                                ${o.status !== 'completado' ? '<p class="text-sm text-muted mt-sm">Los resultados estarán disponibles cuando el laboratorio los procese.</p>' : ''}
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        } catch (err) { UI.showEmpty(content, '🔬', 'Sin resultados', 'No hay resultados disponibles'); }
    },

    // ====== MEDICATIONS ======
    async loadMedications() {
        const content = document.getElementById('patientContent');
        try {
            const data = await api.getPrescriptions('');
            const prescriptions = data.prescriptions || [];
            content.innerHTML = `
                <div class="animate-fade-in">
                    <div class="page-header">
                        <div><h1>Mis Medicamentos</h1><p>Prescripciones activas e historial</p></div>
                    </div>
                    <div class="stagger">
                        ${prescriptions.length === 0 ? '<div class="empty-state"><div class="empty-icon">💊</div><div class="empty-title">Sin prescripciones</div><div class="empty-text">No tienes prescripciones registradas</div></div>' :
                        prescriptions.map(p => `
                            <div class="result-card">
                                <div class="result-header">
                                    <div>
                                        <h4>💊 ${p.medication_name}</h4>
                                        <p class="text-sm text-muted">Prescrito por Dr/a. ${p.doctor_first_name} ${p.doctor_last_name} · ${UI.formatDate(p.prescribed_at)}</p>
                                    </div>
                                    ${UI.statusBadge(p.status)}
                                </div>
                                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 0.75rem; margin-top: 0.75rem;">
                                    ${p.dosage ? `<div><span class="text-sm text-muted">Dosis:</span><br><strong>${p.dosage}</strong></div>` : ''}
                                    ${p.frequency ? `<div><span class="text-sm text-muted">Frecuencia:</span><br><strong>${p.frequency}</strong></div>` : ''}
                                    ${p.duration_days ? `<div><span class="text-sm text-muted">Duración:</span><br><strong>${p.duration_days} días</strong></div>` : ''}
                                </div>
                                ${p.instructions ? `<div class="result-detail mt-sm"><strong>Indicaciones:</strong> ${p.instructions}</div>` : ''}
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        } catch (err) { UI.showEmpty(content, '💊', 'Sin medicamentos', 'No hay prescripciones'); }
    },

    // ====== BILLING ======
    async loadBilling() {
        const content = document.getElementById('patientContent');
        try {
            const data = await api.getInvoices('');
            const invoices = data.invoices || [];
            const total = invoices.reduce((s, i) => s + parseFloat(i.total_amount), 0);
            const pending = invoices.filter(i => i.status === 'pendiente');
            const paid = invoices.filter(i => i.status === 'pagada');

            content.innerHTML = `
                <div class="animate-fade-in">
                    <div class="page-header">
                        <div><h1>Mi Facturación</h1><p>Facturas y estado de pagos</p></div>
                    </div>
                    <div class="stats-grid" style="margin-bottom: 1.5rem;">
                        <div class="stat-card primary"><div class="stat-icon">📄</div><div class="stat-value">${invoices.length}</div><div class="stat-label">Total Facturas</div></div>
                        <div class="stat-card warning"><div class="stat-icon">⏳</div><div class="stat-value">${pending.length}</div><div class="stat-label">Pendientes</div></div>
                        <div class="stat-card success"><div class="stat-icon">✓</div><div class="stat-value">${paid.length}</div><div class="stat-label">Pagadas</div></div>
                    </div>
                    ${invoices.length === 0 ? '<div class="empty-state"><div class="empty-icon">💳</div><div class="empty-title">Sin facturas</div><div class="empty-text">No tienes facturas registradas</div></div>' :
                    `<div class="table-container">
                        <table class="data-table">
                            <thead><tr><th>#</th><th>Fecha</th><th>Monto</th><th>Estado</th><th>Método</th></tr></thead>
                            <tbody>
                                ${invoices.map(i => `
                                    <tr>
                                        <td><strong>#${i.id}</strong></td>
                                        <td>${UI.formatDate(i.created_at)}</td>
                                        <td><strong>${UI.formatCurrency(i.total_amount)}</strong></td>
                                        <td>${UI.statusBadge(i.status)}</td>
                                        <td>${i.payment_method || '—'}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>`}
                </div>
            `;
        } catch (err) { UI.showEmpty(content, '💳', 'Sin facturación', 'No hay facturas'); }
    },

    // ====== PROFILE ======
    async loadProfile() {
        const content = document.getElementById('patientContent');
        try {
            const profile = await api.getProfile();
            content.innerHTML = `
                <div class="animate-fade-in">
                    <div class="page-header">
                        <div><h1>Mi Perfil</h1><p>Datos personales y médicos</p></div>
                    </div>
                    <div class="card">
                        <div style="display: flex; align-items: center; gap: 1.5rem; margin-bottom: 2rem; padding-bottom: 1.5rem; border-bottom: 1px solid var(--border-color);">
                            ${UI.avatar(profile.first_name, profile.last_name, 'avatar-xl')}
                            <div>
                                <h2>${profile.first_name} ${profile.last_name}</h2>
                                <p class="text-muted">${profile.email}</p>
                                <span class="badge badge-primary" style="margin-top: 4px;">Paciente</span>
                            </div>
                        </div>
                        <form onsubmit="PatientApp.updateProfile(event)">
                            <div class="form-row">
                                <div class="form-group">
                                    <label class="form-label">Nombre</label>
                                    <input type="text" class="form-input" value="${profile.first_name}" disabled>
                                </div>
                                <div class="form-group">
                                    <label class="form-label">Apellido</label>
                                    <input type="text" class="form-input" value="${profile.last_name}" disabled>
                                </div>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label class="form-label">Documento</label>
                                    <input type="text" class="form-input" value="${profile.document_id}" disabled>
                                </div>
                                <div class="form-group">
                                    <label class="form-label">Teléfono</label>
                                    <input type="tel" class="form-input" id="profilePhone" value="${profile.phone || ''}">
                                </div>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label class="form-label">Fecha de nacimiento</label>
                                    <input type="text" class="form-input" value="${profile.birth_date ? UI.formatDate(profile.birth_date) : 'No registrada'}" disabled>
                                </div>
                                <div class="form-group">
                                    <label class="form-label">Género</label>
                                    <input type="text" class="form-input" value="${profile.gender || 'No registrado'}" disabled>
                                </div>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label class="form-label">Tipo de Sangre</label>
                                    <select class="form-select" id="profileBlood">
                                        <option value="">Seleccionar</option>
                                        ${['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(b => `<option ${profile.blood_type === b ? 'selected' : ''}>${b}</option>`).join('')}
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label class="form-label">Dirección</label>
                                    <input type="text" class="form-input" id="profileAddress" value="${profile.address || ''}">
                                </div>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Alergias</label>
                                <textarea class="form-textarea" id="profileAllergies" rows="2">${profile.allergies || ''}</textarea>
                            </div>
                            <button type="submit" class="btn btn-primary">Guardar Cambios</button>
                        </form>
                    </div>
                </div>
            `;
        } catch (err) { UI.error('Error al cargar perfil'); }
    },

    async updateProfile(e) {
        e.preventDefault();
        try {
            await api.updateProfile({
                phone: document.getElementById('profilePhone').value,
                blood_type: document.getElementById('profileBlood').value,
                address: document.getElementById('profileAddress').value,
                allergies: document.getElementById('profileAllergies').value,
            });
            UI.success('Perfil actualizado correctamente');
        } catch (err) { UI.error(err.message); }
    },

    logout() {
        api.logout();
        this.user = null;
        this.renderAuth();
        UI.info('Sesión cerrada');
    }
};

// Initialize app
PatientApp.init();
