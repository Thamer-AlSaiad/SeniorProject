import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Button } from '../components/ui/button'
import { API_ENDPOINTS } from '../config/api'
import { getAccessToken, getUserProfile, setUserProfile, redirectToLogin } from '../utils/auth'

const ProfilePage = () => {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProfile = async () => {
      const token = getAccessToken()
      
      if (!token) {
        redirectToLogin()
        return
      }

      // Load cached data as placeholder while fetching
      const cachedProfile = getUserProfile()
      if (cachedProfile) {
        setUser(cachedProfile)
      }

      // Always fetch fresh data from API
      try {
        const response = await fetch(API_ENDPOINTS.profile.get, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        const data = await response.json()

        if (!response.ok) {
          if (response.status === 401) {
            redirectToLogin()
          } else {
            console.error('Failed to fetch profile:', data.message)
          }
          setLoading(false)
          return
        }

        if (data.data) {
          setUser(data.data)
          setUserProfile(data.data)
        }
      } catch (error) {
        console.error('Network error fetching profile:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [])

  const getInitial = () => {
    if (!user) return 'U'
    return user.firstName?.charAt(0).toUpperCase() || 'U'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#2d1b4e] via-[#1a0b2e] to-[#2d1b4e] flex items-center justify-center p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-3xl shadow-2xl p-12 max-w-xl w-full relative"
      >
        <div className="absolute -top-16 left-1/2 transform -translate-x-1/2">
          <div className="w-32 h-32 rounded-full bg-gray-300 flex items-center justify-center">
            <span className="text-6xl font-bold text-[#1a0b2e]">{getInitial()}</span>
          </div>
        </div>

        <div className="mt-20 text-center space-y-3">
          <h1 className="text-4xl font-bold text-gray-900">
            {user?.firstName} {user?.lastName}
          </h1>
          {user?.dateOfBirth && (
            <p className="text-lg text-gray-700">{user.dateOfBirth}</p>
          )}
          {user?.address && (
            <p className="text-lg text-gray-700">{user.address}</p>
          )}
          {user?.phoneNumber && (
            <p className="text-lg text-gray-700">{user.phoneNumber}</p>
          )}
          {user?.gender && (
            <p className="text-lg text-gray-700 capitalize">{user.gender}</p>
          )}
          <p className="text-lg text-gray-600">{user?.email}</p>
        </div>

        <div className="mt-12 flex justify-center gap-6">
          <a href="/edit-profile">
            <Button className="min-w-[180px] h-14 text-base">
              Edit Profile
            </Button>
          </a>
          <a href="/change-password">
            <Button className="min-w-[180px] h-14 text-base">
              Change Password
            </Button>
          </a>
        </div>

        <div className="mt-8 text-center">
          <button 
            onClick={() => window.location.href = '/'}
            className="text-gray-600 hover:text-gray-900 underline"
          >
            Back to Home
          </button>
        </div>
      </motion.div>
    </div>
  )
}

export default ProfilePage
