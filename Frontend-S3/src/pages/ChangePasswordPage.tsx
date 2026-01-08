import { useState, useEffect, FormEvent } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { Input } from '../components/ui/input'
import { Button } from '../components/ui/button'
import { API_ENDPOINTS } from '../config/api'
import { getAccessToken, redirectToLogin } from '../utils/auth'

const ChangePasswordPage = () => {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [email, setEmail] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    const fetchProfile = async () => {
      const token = getAccessToken()
      
      if (!token) {
        redirectToLogin()
        return
      }

      try {
        const response = await fetch(API_ENDPOINTS.profile.get, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        const data = await response.json()

        if (response.ok && data.data) {
          setEmail(data.data.email || '')
        }
      } catch (error) {
        console.error('Failed to fetch profile')
      }
    }

    fetchProfile()
  }, [])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setErrors({})
    setSuccess(false)

    const newErrors: Record<string, string> = {}
    if (!formData.currentPassword) newErrors.currentPassword = 'Required'
    if (!formData.newPassword) newErrors.newPassword = 'Required'
    if (formData.newPassword.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters'
    }
    if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    const token = getAccessToken()
    if (!token) {
      redirectToLogin()
      return
    }

    setLoading(true)
    try {
      const response = await fetch(API_ENDPOINTS.profile.changePassword, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (response.status === 400 && data.message?.toLowerCase().includes('incorrect')) {
          setErrors({ currentPassword: 'Current password is incorrect' })
        } else {
          setErrors({ submit: data.message || 'Failed to change password' })
        }
        return
      }

      setSuccess(true)
      toast.success('Password changed successfully!')
      setTimeout(() => {
        window.location.href = '/profile'
      }, 1500)
    } catch (error) {
      setErrors({ submit: 'Network error. Please try again' })
    } finally {
      setLoading(false)
    }
  }

  const getInitial = () => {
    return email?.charAt(0).toUpperCase() || 'U'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#2d1b4e] via-[#1a0b2e] to-[#2d1b4e] flex items-center justify-center p-8">
      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        onSubmit={handleSubmit}
        autoComplete="off"
        className="bg-white rounded-3xl shadow-2xl p-12 max-w-xl w-full relative"
      >
        <div className="absolute -top-16 left-1/2 transform -translate-x-1/2">
          <div className="w-32 h-32 rounded-full bg-gray-300 flex items-center justify-center">
            <span className="text-6xl font-bold text-[#1a0b2e]">{getInitial()}</span>
          </div>
        </div>

        <div className="mt-20 text-center mb-8">
          <p className="text-xl text-gray-600">{email}</p>
        </div>

        <div className="space-y-6">
          <Input
            label="Current Password :"
            type="password"
            value={formData.currentPassword}
            onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
            error={errors.currentPassword}
            autoComplete="current-password"
          />

          <Input
            label="New Password :"
            type="password"
            value={formData.newPassword}
            onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
            error={errors.newPassword}
            autoComplete="new-password"
          />

          <Input
            label="Confirm Password :"
            type="password"
            value={formData.confirmPassword}
            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
            error={errors.confirmPassword}
            autoComplete="new-password"
          />
        </div>

        {success && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-700 font-medium text-center">Password changed successfully!</p>
          </div>
        )}

        {errors.submit && (
          <p className="mt-6 text-sm text-red-500 text-center">{errors.submit}</p>
        )}

        <div className="mt-8 flex justify-center gap-4">
          <Button type="submit" loading={loading} className="min-w-[140px] h-14 text-base">
            Save
          </Button>
          <button
            type="button"
            onClick={() => window.location.href = '/profile'}
            className="min-w-[140px] h-14 px-8 py-3 rounded-full border-2 border-[#1a0b2e] text-[#1a0b2e] font-medium hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </motion.form>
    </div>
  )
}

export default ChangePasswordPage
