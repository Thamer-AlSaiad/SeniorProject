import { motion } from 'framer-motion'
import picture1 from '../assets/brain.jpg'

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a0b2e] via-[#2d1b4e] to-[#1a0b2e] text-white">
      <nav className="flex justify-end items-center p-8 gap-4">
        <a href="/signup">
          <button className="px-6 py-2 rounded-full border-2 border-purple-500 text-purple-300 hover:bg-purple-500/20 transition-colors">
            Register
          </button>
        </a>
        <a href="/login">
          <button className="px-6 py-2 rounded-full border-2 border-purple-500 text-purple-300 hover:bg-purple-500/20 transition-colors">
            Log In
          </button>
        </a>
      </nav>

      <div className="container mx-auto px-8 py-20 grid lg:grid-cols-2 gap-12 items-center">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-2"
        >
          <h1 className="text-6xl font-bold leading-tight">
            <span className="text-[#6D5884]">VOICE - BASED</span><br />
            SYSTEM FOR<br />
            MEDICAL CLINICS
          </h1>
          <p className="text-xl text-gray-300 leading-relaxed">
            This service helps doctors complete their work faster and easier.
            Join us and make the most of your time. We'll always be at your service
          </p>
          <a href="/signup">
            <button className="mt-8 px-10 py-4 rounded-full border-2 border-white text-white text-lg hover:bg-white hover:text-[#1a0b2e] transition-all">
              Get Started
            </button>
          </a>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative"
        >
          <div className="relative">
            <img
              src={picture1}
              alt="AI Brain"
              className="w-full max-w-4xl mx-auto"
            />
            <div className="absolute inset-0 bg-purple-500/20 blur-3xl rounded-full"></div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default LandingPage
