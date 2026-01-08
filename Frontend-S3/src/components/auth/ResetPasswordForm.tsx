import { useState, FormEvent } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { API_ENDPOINTS } from '../../config/api'

export const ResetPasswordForm = () => {
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setErrors({})

    const newErrors: Record<string, string> = {}
    if (!formData.password) newErrors.password = 'Required'
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setLoading(true)
    try {
      const urlParams = new URLSearchParams(window.location.search)
      const token = urlParams.get('token')
      
      const response = await fetch(API_ENDPOINTS.auth.resetPassword, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          token: token,
          newPassword: formData.password 
        }),
      })

      const data = await response.json()
      
      if (!response.ok) {
        if (response.status === 400) {
          toast.error('Invalid or expired reset token')
        } else {
          toast.error(data.message || 'Failed to reset password')
        }
        return
      }
      
      toast.success('Password reset successfully!')
      setTimeout(() => {
        window.location.href = '/login'
      }, 1500)
    } catch (error) {
      setErrors({ submit: 'Failed to reset password' })
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
      <h1 className="text-5xl font-bold text-gray-900">Reset Password</h1>
      <p className="text-gray-600">Create a new password for your account</p>

      <Input
        label="New password"
        type="password"
        value={formData.password}
        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
        error={errors.password}
        autoComplete="new-password"
      />

      <Input
        label="Confirm new password"
        type="password"
        value={formData.confirmPassword}
        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
        error={errors.confirmPassword}
        autoComplete="new-password"
      />



      <div className="flex justify-center pt-4">
        <Button type="submit" loading={loading} className="min-w-[280px] h-14 text-base">
          Reset password
        </Button>
      </div>

      <p className="text-center text-sm">
        Remember your password? <a href="/login" className="font-medium underline">Log In</a>
      </p>
    </motion.form>
  )
}
