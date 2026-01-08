import { useState, FormEvent } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { API_ENDPOINTS } from '../../config/api'

export const VerifyAccountForm = () => {
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
      const response = await fetch(API_ENDPOINTS.auth.resendVerification, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (response.status === 400 && data.message?.toLowerCase().includes('already verified')) {
          setErrors({ submit: 'Email is already verified' })
        } else {
          setErrors({ submit: data.message || 'Failed to send verification link' })
        }
        return
      }

      alert('Verification email sent successfully')
      setEmail('')
    } catch (error) {
      setErrors({ submit: 'Failed to send verification link' })
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
      <h1 className="text-5xl font-bold text-gray-900 text-center">Verify Your Account</h1>
      <p className="text-gray-600 text-center">Enter your email to get a new verification link</p>

      <Input
        label="Email Address"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={errors.email}
      />



      <div className="flex justify-center pt-4">
        <Button type="submit" loading={loading} className="min-w-[280px] h-14 text-base">
          Send Verification Link
        </Button>
      </div>

      <p className="text-center text-sm">
        Back to <a href="/login" className="font-medium underline">Log In</a>
      </p>
    </motion.form>
  )
}
