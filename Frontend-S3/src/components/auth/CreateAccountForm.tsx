import { useState, FormEvent } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { Checkbox } from '../ui/checkbox'
import { API_ENDPOINTS } from '../../config/api'

export const CreateAccountForm = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setErrors({})

    // Missing Required Fields validation
    const newErrors: Record<string, string> = {}
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required'
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required'
    if (!formData.email.trim()) newErrors.email = 'Email is required'
    if (!formData.password) newErrors.password = 'Password is required'
    if (!formData.confirmPassword) newErrors.confirmPassword = 'Please confirm your password'

    // Invalid Password validation
    if (formData.password && formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters'
    }
    if (formData.password !== formData.confirmPassword && formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setLoading(true)
    try {
      const response = await fetch(API_ENDPOINTS.auth.register, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (response.status === 409) {
          setErrors({ email: 'Email already exists' })
          toast.error('Email already exists')
        } else if (response.status === 400 && data.errors) {
          const apiErrors: Record<string, string> = {}
          Object.keys(data.errors).forEach(key => {
            apiErrors[key] = data.errors[key][0]
          })
          setErrors(apiErrors)
          toast.error('Please check all fields')
        } else {
          toast.error(data.message || 'Failed to create account')
        }
        return
      }
      
      setErrors({})
      toast.success('Account created! Please check your email to verify.')
      
      setTimeout(() => {
        window.location.href = '/login'
      }, 2000)
    } catch (error) {
      setErrors({ submit: 'Network error. Please try again later' })
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
      <h1 className="text-4xl font-bold text-gray-900">Create An Account</h1>

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="First name"
          value={formData.firstName}
          onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
          error={errors.firstName}
        />
        <Input
          label="Last name"
          value={formData.lastName}
          onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
          error={errors.lastName}
        />
      </div>

      <Input
        label="Email Address"
        type="email"
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        error={errors.email}
      />

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Password"
          type={showPassword ? 'text' : 'password'}
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          error={errors.password}
          autoComplete="new-password"
        />
        <Input
          label="Confirm your password"
          type={showPassword ? 'text' : 'password'}
          value={formData.confirmPassword}
          onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
          error={errors.confirmPassword}
          autoComplete="new-password"
        />
      </div>

      <p className="text-xs text-gray-500">
        Use 8 or more characters with letters, numbers & symbols
      </p>

      <Checkbox
        label="Show password"
        checked={showPassword}
        onChange={(e) => setShowPassword(e.target.checked)}
      />



      <div className="flex justify-center pt-4">
        <Button type="submit" loading={loading} className="min-w-[280px] h-14 text-base">
          Create an account
        </Button>
      </div>

      <p className="text-center text-sm">
        Already have an account? <a href="/login" className="font-medium underline">Login</a>
      </p>
    </motion.form>
  )
}
