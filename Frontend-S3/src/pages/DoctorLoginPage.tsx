import { motion } from 'framer-motion'
import { DoctorLoginForm } from '../components/auth/DoctorLoginForm'
import doctorsImg from '../assets/doctors.svg'

const DoctorLoginPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
      <div className="w-full max-w-7xl grid lg:grid-cols-2 gap-12 items-center">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="hidden lg:flex justify-center"
        >
          <img src={doctorsImg} alt="Doctors" className="w-full max-w-md" />
        </motion.div>

        <div className="flex justify-center lg:justify-start">
          <DoctorLoginForm />
        </div>
      </div>
    </div>
  )
}

export default DoctorLoginPage
