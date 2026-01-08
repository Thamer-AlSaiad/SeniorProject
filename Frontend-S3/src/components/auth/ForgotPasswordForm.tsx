import { useState, FormEvent } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { API_ENDPOINTS } from '../../config/api'

export const ForgotPasswordForm = () => {
  const [email, setEmail] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setErrors({})

    if (!email) {
      setErrors({ email: 'Required' })
      return
    }

    setLoading(true)
    try {
      const response = await fetch(API_ENDPOINTS.auth.forgotPassword, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()
      
      if (response.ok) {
        toast.success('Password reset email sent successfully')
        setEmail('')
      } else {
        if (response.status === 429) {
          toast.error('Please wait before requesting another password reset')
        } else {
          toast.error(data.message || 'Failed to send reset link')
        }
      }
    } catch (error) {
      setErrors({ submit: 'Failed to send reset link' })
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
      className="w-full max-w-lg space-y-6"
    >
      <h1 className="text-5xl font-bold text-gray-900">Forgot Password</h1>
      <p className="text-gray-600">
        Enter your email address and we'll send you a link to reset your password
      </p>

      <Input
        label="Email Address"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={errors.email}
      />



      <div className="flex justify-center pt-4">
        <Button type="submit" loading={loading} className="min-w-[280px] h-14 text-base">
          Send reset link
        </Button>
      </div>
    </motion.form>
  )
}
