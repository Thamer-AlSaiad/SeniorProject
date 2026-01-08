import axios, { AxiosError, AxiosInstance } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL;

// Create axios instance
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('userProfile');
      
      const userRole = localStorage.getItem('userRole');
      if (userRole === 'doctor') {
        window.location.href = '/doctor/login';
      } else {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// API Endpoints
export const API_ENDPOINTS = {
  // Auth
  doctor: {
    login: '/doctor/auth/login',
    profile: '/doctor/profile',
    changePassword: '/doctor/profile/change-password',
  },
  patient: {
    login: '/patient/auth/login',
    register: '/patient/auth/register',
    profile: '/patient/profile',
  },
  admin: {
    login: '/admin/auth/login',
    profile: '/admin/profile',
  },
  // Admin - Organizations
  organizations: {
    base: '/admin/organizations',
    byId: (id: string) => `/admin/organizations/${id}`,
    deactivate: (id: string) => `/admin/organizations/${id}/deactivate`,
    activate: (id: string) => `/admin/organizations/${id}/activate`,
    doctors: (id: string) => `/admin/organizations/${id}/doctors`,
    stats: (id: string) => `/admin/organizations/${id}/stats`,
  },
  // Admin - Doctor Management
  doctorManagement: {
    base: '/admin/doctors',
    byId: (id: string) => `/admin/doctors/${id}`,
    suspend: (id: string) => `/admin/doctors/${id}/suspend`,
    activate: (id: string) => `/admin/doctors/${id}/activate`,
    assignOrg: (id: string) => `/admin/doctors/${id}/assign-org`,
    removeOrg: (id: string) => `/admin/doctors/${id}/remove-org`,
  },
  // Clinical - Doctor
  patients: {
    base: '/doctor/patients',
    byId: (id: string) => `/doctor/patients/${id}`,
  },
  encounters: {
    base: '/doctor/encounters',
    active: '/doctor/encounters/active',
    byPatient: (patientId: string) => `/doctor/encounters/patient/${patientId}`,
    byId: (id: string) => `/doctor/encounters/${id}`,
    start: (id: string) => `/doctor/encounters/${id}/start`,
    complete: (id: string) => `/doctor/encounters/${id}/complete`,
    cancel: (id: string) => `/doctor/encounters/${id}/cancel`,
  },
  medicalRecords: {
    base: '/doctor/medical-records',
    byPatient: (patientId: string) => `/doctor/medical-records/patient/${patientId}`,
    byEncounter: (encounterId: string) => `/doctor/medical-records/encounter/${encounterId}`,
    byId: (id: string) => `/doctor/medical-records/${id}`,
    updateField: (id: string) => `/doctor/medical-records/${id}/field`,
    finalize: (id: string) => `/doctor/medical-records/${id}/finalize`,
  },
  allergies: {
    base: '/doctor/allergies',
    byPatient: (patientId: string) => `/doctor/allergies/patient/${patientId}`,
    byId: (id: string) => `/doctor/allergies/${id}`,
  },
  vitalSigns: {
    base: '/doctor/vital-signs',
    bulk: '/doctor/vital-signs/bulk',
    byPatient: (patientId: string) => `/doctor/vital-signs/patient/${patientId}`,
    latestAll: (patientId: string) => `/doctor/vital-signs/patient/${patientId}/latest`,
    byEncounter: (encounterId: string) => `/doctor/vital-signs/encounter/${encounterId}`,
    byId: (id: string) => `/doctor/vital-signs/${id}`,
  },
  transcriptions: {
    upload: '/doctor/transcriptions/upload',
    realtime: '/doctor/transcriptions/realtime',
    base: '/doctor/transcriptions',
    supportedFormats: '/doctor/transcriptions/supported-formats',
    byId: (id: string) => `/doctor/transcriptions/${id}`,
    retry: (id: string) => `/doctor/transcriptions/${id}/retry`,
  },
  // Doctor - Schedules
  schedules: {
    base: '/doctor/schedules',
    byId: (id: string) => `/doctor/schedules/${id}`,
    generateSlots: (id: string) => `/doctor/schedules/${id}/generate-slots`,
  },
  // Doctor - Schedule Exceptions
  scheduleExceptions: {
    base: '/doctor/schedule-exceptions',
    byId: (id: string) => `/doctor/schedule-exceptions/${id}`,
    upcoming: '/doctor/schedule-exceptions/upcoming',
  },
  // Doctor - Appointments
  appointments: {
    base: '/doctor/appointments',
    today: '/doctor/appointments/today',
    byId: (id: string) => `/doctor/appointments/${id}`,
    checkIn: (id: string) => `/doctor/appointments/${id}/check-in`,
    start: (id: string) => `/doctor/appointments/${id}/start`,
    complete: (id: string) => `/doctor/appointments/${id}/complete`,
    noShow: (id: string) => `/doctor/appointments/${id}/no-show`,
    cancel: (id: string) => `/doctor/appointments/${id}/cancel`,
  },
};

// Patient Booking Endpoints
export const PATIENT_ENDPOINTS = {
  // Clinics
  clinics: {
    base: '/patient/clinics',
    doctors: (id: string) => `/patient/clinics/${id}/doctors`,
  },
  // Available Slots
  availableSlots: (doctorId: string) => `/patient/doctors/${doctorId}/available-slots`,
  // Patient Appointments
  patientAppointments: {
    base: '/patient/appointments',
    byId: (id: string) => `/patient/appointments/${id}`,
    cancel: (id: string) => `/patient/appointments/${id}/cancel`,
  },
  // Patient Medical Records
  patientMedicalRecords: {
    base: '/patient/medical-records',
    byId: (id: string) => `/patient/medical-records/${id}`,
  },
  // Patient Allergies
  patientAllergies: '/patient/allergies',
  // Patient Encounters
  patientEncounters: '/patient/encounters',
};

export default apiClient;
