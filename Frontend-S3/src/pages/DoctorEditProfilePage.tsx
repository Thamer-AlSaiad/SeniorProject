import { useState, useEffect, FormEvent } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { Input } from '../components/ui/input'
import { Select } from '../components/ui/select'
import { Button } from '../components/ui/button'
import { API_ENDPOINTS } from '../config/api'
import { getAccessToken, setUserProfile, redirectToLogin } from '../utils/auth'

const DoctorEditProfilePage = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    specialization: '',
    licenseNumber: '',
    phoneNumber: '',
    gender: '',
  })
  const [email, setEmail] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchProfile = async () => {
      const token = getAccessToken()
      
      if (!token) {
        redirectToLogin()
        return
      }

      try {
        const response = await fetch(API_ENDPOINTS.doctor.profile.get, {
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
            toast.error('Failed to load profile data')
          }
          return
        }

        if (data.data) {
          setEmail(data.data.email || '')
          setFormData({
            firstName: data.data.firstName || '',
            lastName: data.data.lastName || '',
            specialization: data.data.specialization || '',
            licenseNumber: data.data.licenseNumber || '',
            phoneNumber: data.data.phoneNumber || '',
            gender: data.data.gender || '',
          })
        }
      } catch (error) {
        console.error('Network error fetching profile:', error)
        toast.error('Network error loading profile')
      }
    }

    fetchProfile()
  }, [])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setErrors({})

    const token = getAccessToken()
    if (!token) {
      redirectToLogin()
      return
    }

    setLoading(true)
    try {
      const response = await fetch(API_ENDPOINTS.doctor.profile.update, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        if (response.status === 400 && data.errors) {
          const apiErrors: Record<string, string> = {}
          Object.keys(data.errors).forEach(key => {
            apiErrors[key] = data.errors[key][0]
          })
          setErrors(apiErrors)
          toast.error('Please check all fields')
        } else {
          toast.error(data.message || 'Failed to update profile')
        }
        return
      }

      if (data.data) {
        setUserProfile(data.data)
      }
      
      toast.success('Profile updated successfully!')
      setTimeout(() => {
        window.location.href = '/doctor/profile'
      }, 1500)
    } catch (error) {
      setErrors({ submit: 'Network error. Please try again' })
    } finally {
      setLoading(false)
    }
  }

  const getInitial = () => {
    return formData.firstName?.charAt(0).toUpperCase() || 'D'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#2d1b4e] via-[#1a0b2e] to-[#2d1b4e] flex items-center justify-center p-8">
      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        onSubmit={handleSubmit}
        className="bg-white rounded-3xl shadow-2xl p-12 max-w-2xl w-full relative"
      >
        <div className="absolute -top-16 left-1/2 transform -translate-x-1/2">
          <div className="w-32 h-32 rounded-full bg-gray-300 flex items-center justify-center">
            <span className="text-6xl font-bold text-[#1a0b2e]">{getInitial()}</span>
          </div>
        </div>

        <div className="mt-20 text-center mb-8">
          <div className="inline-block px-4 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium mb-2">
            Clinician Profile
          </div>
          <p className="text-xl text-gray-600">{email}</p>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <Input
              label="First Name :"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              error={errors.firstName}
            />
            <Input
              label="Last Name:"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              error={errors.lastName}
            />
          </div>

          <Input
            label="Specialization :"
            value={formData.specialization}
            onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
            error={errors.specialization}
            placeholder="e.g., Cardiology, Neurology"
          />

          <div className="grid grid-cols-2 gap-6">
            <Input
              label="License Number :"
              value={formData.licenseNumber}
              onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
              error={errors.licenseNumber}
            />
            <Input
              label="Phone Number :"
              value={formData.phoneNumber}
              onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
              error={errors.phoneNumber}
            />
          </div>

          <Select
            label="Gender :"
            value={formData.gender}
            onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
            error={errors.gender}
          >
            <option value="">Select Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </Select>
        </div>

        <div className="mt-8 flex justify-center">
          <Button type="submit" loading={loading} className="min-w-[200px] h-14 text-base">
            Save Changes
          </Button>
        </div>

        <div className="mt-6 text-center">
          <button 
            type="button"
            onClick={() => window.location.href = '/doctor/profile'}
            className="text-gray-600 hover:text-gray-900 underline"
          >
            Cancel
          </button>
        </div>
      </motion.form>
    </div>
  )
}

export default DoctorEditProfilePage
