import { Toaster } from 'react-hot-toast'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import LandingPage from './pages/LandingPage'
import DashboardPage from './pages/DashboardPage'
import ProfilePage from './pages/ProfilePage'
import EditProfilePage from './pages/EditProfilePage'
import ChangePasswordPage from './pages/ChangePasswordPage'
import CreateAccountPage from './pages/CreateAccountPage'
import LoginPage from './pages/LoginPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import ResetPasswordPage from './pages/ResetPasswordPage'
import VerifyAccountPage from './pages/VerifyAccountPage'
import AccountVerifiedPage from './pages/AccountVerifiedPage'
import EmailVerificationPage from './pages/EmailVerificationPage'
import NotFoundPage from './pages/NotFoundPage'
import DoctorLoginPage from './pages/DoctorLoginPage'
import DoctorProfilePage from './pages/DoctorProfilePage'
import DoctorEditProfilePage from './pages/DoctorEditProfilePage'
import AdminLoginPage from './pages/AdminLoginPage'
import {
  DoctorDashboardPage,
  DoctorEncountersPage,
  DoctorEncounterDetailPage,
  DoctorPatientsPage,
  DoctorPatientDetailPage,
  DoctorSchedulePage,
  DoctorAppointmentsPage,
} from './pages/doctor'
import {
  AdminDashboardPage,
  AdminOrganizationsPage,
  AdminDoctorsPage,
} from './pages/admin'
import {
  PatientBookingPage,
  PatientAppointmentsPage,
  PatientMedicalRecordsPage,
} from './pages/patient'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
})

function AppContent() {
  const path = window.location.pathname
  const isLoggedIn = localStorage.getItem('accessToken')

  // Doctor dashboard routes (Sprint 2)
  if (path === '/doctor/dashboard') return <DoctorDashboardPage />
  if (path === '/doctor/visits') return <DoctorEncountersPage />
  if (path.startsWith('/doctor/visits/') && path !== '/doctor/visits/') return <DoctorEncounterDetailPage />
  if (path === '/doctor/patients') return <DoctorPatientsPage />
  if (path.startsWith('/doctor/patients/') && path !== '/doctor/patients/') return <DoctorPatientDetailPage />
  if (path === '/doctor/schedule') return <DoctorSchedulePage />
  if (path === '/doctor/appointments') return <DoctorAppointmentsPage />

  // Doctor auth routes
  if (path === '/doctor/login') return <DoctorLoginPage />
  if (path === '/doctor/profile') return <DoctorProfilePage />
  if (path === '/doctor/edit-profile') return <DoctorEditProfilePage />
  if (path === '/doctor/change-password') return <ChangePasswordPage />

  // Admin dashboard routes (Sprint 3-4)
  if (path === '/admin/dashboard') return <AdminDashboardPage />
  if (path === '/admin/organizations') return <AdminOrganizationsPage />
  if (path.startsWith('/admin/organizations/') && path !== '/admin/organizations/') return <AdminOrganizationsPage />
  if (path === '/admin/doctors') return <AdminDoctorsPage />
  if (path.startsWith('/admin/doctors/') && path !== '/admin/doctors/') return <AdminDoctorsPage />

  // Admin auth routes
  if (path === '/admin/login') return <AdminLoginPage />

  // Patient portal routes (Sprint 3-4)
  if (path === '/patient/booking') return <PatientBookingPage />
  if (path === '/patient/appointments') return <PatientAppointmentsPage />
  if (path === '/patient/medical-records') return <PatientMedicalRecordsPage />

  // Patient auth routes
  if (path === '/login') return <LoginPage />
  if (path === '/signup') return <CreateAccountPage />
  if (path === '/forgot-password') return <ForgotPasswordPage />
  if (path === '/reset-password') return <ResetPasswordPage />
  if (path === '/verify-account') return <VerifyAccountPage />
  if (path === '/account-verified') return <AccountVerifiedPage />
  if (path === '/patient/verify-email' || path === '/verify-email') return <EmailVerificationPage />
  if (path === '/profile') return <ProfilePage />
  if (path === '/edit-profile') return <EditProfilePage />
  if (path === '/change-password') return <ChangePasswordPage />

  if (path === '/' || path === '') {
    return isLoggedIn ? <DashboardPage /> : <LandingPage />
  }

  return <NotFoundPage />
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Toaster position="top-center" />
      <AppContent />
    </QueryClientProvider>
  )
}

export default App
