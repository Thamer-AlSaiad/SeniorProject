import { motion } from 'framer-motion'
import { AdminLoginForm } from '../components/auth/AdminLoginForm'

const AdminLoginPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 flex items-center justify-center p-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-3xl shadow-2xl p-12 max-w-lg w-full"
      >
        <AdminLoginForm />
      </motion.div>
    </div>
  )
}

export default AdminLoginPage
