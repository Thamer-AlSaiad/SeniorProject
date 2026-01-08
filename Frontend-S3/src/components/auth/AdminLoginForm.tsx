import { useState, FormEvent } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { API_ENDPOINTS } from '../../config/api'
import { setAuthTokens, setUserRole } from '../../utils/auth'

export const AdminLoginForm = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setErrors({})

    const newErrors: Record<string, string> = {}
    if (!formData.email.trim()) newErrors.email = 'Email is required'
    if (!formData.password) newErrors.password = 'Password is required'

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setLoading(true)
    try {
      const response = await fetch(API_ENDPOINTS.admin.login, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        if (response.status === 401) {
          toast.error('Invalid credentials')
        } else if (response.status === 403) {
          toast.error('Access denied. Unauthorized access attempt.')
        } else {
          toast.error(data.message || 'Failed to login')
        }
        return
      }

      if (data.data?.accessToken) {
        setAuthTokens({
          accessToken: data.data.accessToken,
          refreshToken: data.data.refreshToken
        })
        setUserRole('admin')
      }

      toast.success('Login successful! Redirecting...')
      setTimeout(() => {
        window.location.href = '/admin/dashboard'
      }, 1000)
    } catch (error) {
      setErrors({ submit: 'Network error. Please check your connection and try again' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      onSubmit={handleSubmit}
      autoComplete="off"
      className="w-full max-w-lg space-y-6"
    >
      <div>
        <h1 className="text-5xl font-bold text-gray-900">Admin Login</h1>
        <p className="text-gray-600 mt-2">System administration access</p>
      </div>

      <Input
        label="Email Address"
        type="email"
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        error={errors.email}
      />

      <Input
        label="Password"
        type="password"
        value={formData.password}
        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
        error={errors.password}
        autoComplete="off"
      />

      <div className="flex justify-center pt-4">
        <Button type="submit" loading={loading} className="min-w-[280px] h-14 text-base">
          Log In
        </Button>
      </div>
    </motion.form>
  )
}
