import { motion } from 'framer-motion'
import { Home, ArrowLeft } from 'lucide-react'
import { Button } from '../components/ui/button'
import { getUserRole, isAuthenticated } from '../utils/auth'

const NotFoundPage = () => {
  const role = getUserRole()
  const loggedIn = isAuthenticated()
  
  const getHomeLink = () => {
    if (!loggedIn) return '/'
    
    if (role === 'doctor') return '/doctor/profile'
    if (role === 'admin') return '/admin/dashboard'
    return '/'
  }

  const getRoleText = () => {
    if (role === 'doctor') return 'Clinician Portal'
    if (role === 'admin') return 'Admin Portal'
    return 'Patient Portal'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#2d1b4e] via-[#1a0b2e] to-[#2d1b4e] flex items-center justify-center p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-3xl shadow-2xl p-12 max-w-lg w-full text-center space-y-6"
      >
        <motion.h1
          initial={{ scale: 0.5 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-9xl font-bold text-[#1a0b2e]"
        >
          404
        </motion.h1>
        
        <h2 className="text-3xl font-bold text-gray-900">Page Not Found</h2>
        
        <p className="text-gray-600">
          The page you're looking for doesn't exist or has been moved.
        </p>

        {loggedIn && (
          <div className="inline-block px-4 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
            {getRoleText()}
          </div>
        )}

        <div className="flex gap-4 justify-center pt-4">
          <button
            onClick={() => window.history.back()}
            className="flex items-center gap-2 px-6 py-3 rounded-full border-2 border-[#1a0b2e] text-[#1a0b2e] hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>
          
          <a href={getHomeLink()}>
            <Button className="flex items-center gap-2">
              <Home className="w-4 h-4" />
              Home
            </Button>
          </a>
        </div>
      </motion.div>
    </div>
  )
}

export default NotFoundPage
