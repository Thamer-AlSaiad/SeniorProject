// Authentication utility functions
export interface UserProfile {
  id: string
  email: string
  firstName: string
  lastName: string
  address?: string
  phoneNumber?: string
  gender?: string
  dateOfBirth?: string
  specialization?: string
  licenseNumber?: string
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
}

export type UserRole = 'patient' | 'doctor' | 'admin'

// Get subdomain to determine user type
export const getSubdomain = (): string | null => {
  const hostname = window.location.hostname
  const parts = hostname.split('.')
  
  // For localhost development
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return null
  }
  
  // For subdomains like clinician.example.com or admin.example.com
  if (parts.length > 2) {
    return parts[0]
  }
  
  return null
}

// Determine user role based on subdomain or stored role
export const getUserRole = (): UserRole => {
  const subdomain = getSubdomain()
  
  if (subdomain === 'clinician') return 'doctor'
  if (subdomain === 'admin') return 'admin'
  
  // Fallback to stored role or default to patient
  const storedRole = localStorage.getItem('userRole')
  return (storedRole as UserRole) || 'patient'
}

// Store user role
export const setUserRole = (role: UserRole) => {
  localStorage.setItem('userRole', role)
}

// Store tokens
export const setAuthTokens = (tokens: AuthTokens) => {
  localStorage.setItem('accessToken', tokens.accessToken)
  localStorage.setItem('refreshToken', tokens.refreshToken)
}

// Get access token
export const getAccessToken = (): string | null => {
  return localStorage.getItem('accessToken')
}

// Get refresh token
export const getRefreshToken = (): string | null => {
  return localStorage.getItem('refreshToken')
}

// Clear all auth data
export const clearAuth = () => {
  localStorage.removeItem('accessToken')
  localStorage.removeItem('refreshToken')
  localStorage.removeItem('userProfile')
  localStorage.removeItem('userRole')
}

// Store user profile
export const setUserProfile = (profile: UserProfile) => {
  localStorage.setItem('userProfile', JSON.stringify(profile))
}

// Get user profile
export const getUserProfile = (): UserProfile | null => {
  const profile = localStorage.getItem('userProfile')
  return profile ? JSON.parse(profile) : null
}

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  return !!getAccessToken()
}

// Redirect to login based on role
export const redirectToLogin = () => {
  clearAuth()
  const role = getUserRole()
  
  if (role === 'doctor') {
    window.location.href = '/doctor/login'
  } else if (role === 'admin') {
    window.location.href = '/admin/login'
  } else {
    window.location.href = '/login'
  }
}
