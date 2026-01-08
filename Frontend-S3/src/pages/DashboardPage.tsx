import { motion } from 'framer-motion'
import brainImg from '../assets/brain.jpg'
import { clearAuth } from '../utils/auth'

const DashboardPage = () => {
    const handleLogout = () => {
        clearAuth()
        window.location.href = '/'
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#1a0b2e] via-[#2d1b4e] to-[#1a0b2e] text-white">
            <nav className="flex justify-between items-center p-6 border-b border-purple-500/20">
                <a href="/" className="text-2xl font-bold">EMR System</a>
                <div className="flex-1 flex justify-center items-center gap-8">
                    <a href="/patient/booking" className="text-purple-300 hover:text-white transition-colors">
                        Book Appointment
                    </a>
                    <a href="/patient/appointments" className="text-purple-300 hover:text-white transition-colors">
                        My Appointments
                    </a>
                    <a href="/patient/medical-records" className="text-purple-300 hover:text-white transition-colors">
                        Medical Records
                    </a>
                </div>
                <div className="flex items-center gap-4">
                    <a href="/profile">
                        <button className="px-4 py-2 rounded-full border border-purple-500 text-purple-300 hover:bg-purple-500/20 transition-colors">
                            Profile
                        </button>
                    </a>
                    <button
                        onClick={handleLogout}
                        className="px-4 py-2 rounded-full border border-purple-500 text-purple-300 hover:bg-purple-500/20 transition-colors"
                    >
                        Log Out
                    </button>
                </div>
            </nav>

            <div className="container mx-auto px-8 py-20">
                {/* Hero Section */}
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                        className="space-y-6"
                    >
                        <h1 className="text-5xl font-bold leading-tight">
                            <span className="text-[#6D5884]">VOICE - BASED</span><br />
                            SYSTEM FOR<br />
                            MEDICAL CLINICS
                        </h1>
                        <p className="text-xl text-gray-300 leading-relaxed">
                            This service helps doctors complete their work faster and easier.
                            Join us and make the most of your time. We'll always be at your service
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="relative"
                    >
                        <div className="relative">
                            <img
                                src={brainImg}
                                alt="AI Brain"
                                className="w-full max-w-4xl mx-auto"
                            />
                            <div className="absolute inset-0 bg-purple-500/20 blur-3xl rounded-full"></div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    )
}

export default DashboardPage
