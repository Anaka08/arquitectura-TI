// =============================================
// SaludDigital - API Client
// =============================================

const API_BASE = '/api';

class ApiClient {
    constructor() {
        this.baseUrl = API_BASE;
    }

    getToken() {
        return localStorage.getItem('sd_token');
    }

    setToken(token) {
        localStorage.setItem('sd_token', token);
    }

    getUser() {
        const user = localStorage.getItem('sd_user');
        return user ? JSON.parse(user) : null;
    }

    setUser(user) {
        localStorage.setItem('sd_user', JSON.stringify(user));
    }

    logout() {
        localStorage.removeItem('sd_token');
        localStorage.removeItem('sd_user');
    }

    async request(method, endpoint, data = null) {
        const config = {
            method,
            headers: {
                'Content-Type': 'application/json',
            }
        };

        const token = this.getToken();
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }

        if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
            config.body = JSON.stringify(data);
        }

        try {
            const response = await fetch(`${this.baseUrl}${endpoint}`, config);
            const result = await response.json();

            if (!response.ok) {
                if (response.status === 401 && !endpoint.includes('/auth/login')) {
                    this.logout();
                    window.location.href = window.location.port === '4001' ? '/' : '/patient';
                }
                throw new Error(result.error || 'Error en la solicitud');
            }

            return result;
        } catch (error) {
            if (error.message === 'Failed to fetch') {
                throw new Error('No se puede conectar con el servidor');
            }
            throw error;
        }
    }

    // Auth
    async login(email, password) {
        const result = await this.request('POST', '/auth/login', { email, password });
        this.setToken(result.token);
        this.setUser(result.user);
        return result;
    }

    async register(data) {
        const result = await this.request('POST', '/auth/register', data);
        this.setToken(result.token);
        this.setUser(result.user);
        return result;
    }

    async createStaff(data) {
        return this.request('POST', '/auth/create-staff', data);
    }

    // Patients
    async getProfile() { return this.request('GET', '/patients/profile'); }
    async updateProfile(data) { return this.request('PUT', '/patients/profile', data); }
    async getPatients(params = '') { return this.request('GET', `/patients?${params}`); }
    async getPatient(id) { return this.request('GET', `/patients/${id}`); }
    async createPatient(data) { return this.request('POST', '/patients', data); }

    // Appointments
    async getAppointments(params = '') { return this.request('GET', `/appointments?${params}`); }
    async createAppointment(data) { return this.request('POST', '/appointments', data); }
    async updateAppointment(id, data) { return this.request('PUT', `/appointments/${id}`, data); }
    async getAvailability(doctorId, date) { return this.request('GET', `/appointments/availability?doctor_id=${doctorId}&date=${date}`); }
    async getDoctors(specialtyId = '') { return this.request('GET', `/appointments/doctors?specialty_id=${specialtyId}`); }
    async getSpecialties() { return this.request('GET', '/appointments/specialties'); }

    // Medical Records
    async getRecords(patientId) { return this.request('GET', `/records/${patientId}`); }
    async createRecord(data) { return this.request('POST', '/records', data); }
    async getRecordSummary(patientId) { return this.request('GET', `/records/${patientId}/summary`); }

    // Lab
    async getLabOrders(params = '') { return this.request('GET', `/lab/orders?${params}`); }
    async createLabOrder(data) { return this.request('POST', '/lab/orders', data); }
    async uploadLabResults(id, data) { return this.request('PUT', `/lab/orders/${id}/results`, data); }

    // Pharmacy
    async getPrescriptions(params = '') { return this.request('GET', `/pharmacy/prescriptions?${params}`); }
    async createPrescription(data) { return this.request('POST', '/pharmacy/prescriptions', data); }
    async dispenseMedication(data) { return this.request('POST', '/pharmacy/dispense', data); }
    async getMedications(params = '') { return this.request('GET', `/pharmacy/medications?${params}`); }

    // Billing
    async getInvoices(params = '') { return this.request('GET', `/billing/invoices?${params}`); }
    async createInvoice(data) { return this.request('POST', '/billing/invoices', data); }
    async payInvoice(id, data) { return this.request('PUT', `/billing/invoices/${id}/pay`, data); }

    // Dashboard
    async getStats() { return this.request('GET', '/dashboard/stats'); }
    async getChartData() { return this.request('GET', '/dashboard/chart-data'); }
    async getAuditLogs(params = '') { return this.request('GET', `/dashboard/audit?${params}`); }

    // Users
    async getUsers(params = '') { return this.request('GET', `/users?${params}`); }
    async toggleUser(id) { return this.request('PUT', `/users/${id}/toggle`); }
}

const api = new ApiClient();
