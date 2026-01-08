import { motion } from 'framer-motion'
import { ForgotPasswordForm } from '../components/auth/ForgotPasswordForm'
import picture3 from '../assets/forgot-password.svg'

const ForgotPasswordPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
      <div className="w-full max-w-7xl grid lg:grid-cols-2 gap-12 items-center">
        <div className="flex justify-center lg:justify-end">
          <ForgotPasswordForm />
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="hidden lg:flex justify-center"
        >
          <img
            src={picture3}
            alt="Forgot Password"
            className="w-full max-w-md"
          />
        </motion.div>
      </div>
    </div>
  )
}

export default ForgotPasswordPage
