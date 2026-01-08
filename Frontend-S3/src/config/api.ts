export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const API_ENDPOINTS = {
  auth: {
    register: `${API_BASE_URL}/patient/auth/register`,
    login: `${API_BASE_URL}/patient/auth/login`,
    verifyEmail: `${API_BASE_URL}/patient/auth/verify-email`,
    resendVerification: `${API_BASE_URL}/patient/auth/resend-verification`,
    forgotPassword: `${API_BASE_URL}/patient/auth/forgot-password`,
    resetPassword: `${API_BASE_URL}/patient/auth/reset-password`,
  },
  profile: {
    get: `${API_BASE_URL}/patient/profile`,
    update: `${API_BASE_URL}/patient/profile`,
    changePassword: `${API_BASE_URL}/patient/profile/change-password`,
    delete: `${API_BASE_URL}/patient/profile`,
  },
  doctor: {
    login: `${API_BASE_URL}/doctor/auth/login`,
    profile: {
      get: `${API_BASE_URL}/doctor/profile`,
      update: `${API_BASE_URL}/doctor/profile`,
      changePassword: `${API_BASE_URL}/doctor/profile/change-password`,
    }
  },
  admin: {
    login: `${API_BASE_URL}/admin/auth/login`,
    profile: {
      get: `${API_BASE_URL}/admin/profile`,
      update: `${API_BASE_URL}/admin/profile`,
      changePassword: `${API_BASE_URL}/admin/profile/change-password`,
    }
  },
}
