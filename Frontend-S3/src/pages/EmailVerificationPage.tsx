import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Loader2, CheckCircle, XCircle } from 'lucide-react'
import { Button } from '../components/ui/button'
import { API_ENDPOINTS } from '../config/api'

const EmailVerificationPage = () => {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')
  const [redirectScheduled, setRedirectScheduled] = useState(false)

  useEffect(() => {
    let timeoutId: number | undefined

    const verifyEmail = async () => {
      const urlParams = new URLSearchParams(window.location.search)
      const token = urlParams.get('token')

      if (!token) {
        setStatus('error')
        setMessage('Invalid verification link')
        return
      }

      try {
        const response = await fetch(API_ENDPOINTS.auth.verifyEmail, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        })

        let data: { message?: string } = {}
        try {
          data = await response.json()
        } catch (err) {
          // ignore JSON parsing errors and rely on default messages
        }

        if (response.ok) {
          setStatus('success')
          setMessage(data.message || 'Email verified successfully')
          timeoutId = window.setTimeout(() => {
            window.location.href = '/login'
          }, 5000)
          setRedirectScheduled(true)
        } else {
          setStatus('error')
          setMessage(data.message || 'Verification failed')
        }
      } catch (error) {
        setStatus('error')
        setMessage('Network error. Please try again.')
      }
    }

    verifyEmail()

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
    }
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#2d1b4e] via-[#1a0b2e] to-[#2d1b4e] flex items-center justify-center p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-3xl shadow-2xl p-12 max-w-md w-full text-center space-y-6"
      >
        {status === 'loading' && (
          <>
            <Loader2 className="w-16 h-16 text-purple-600 animate-spin mx-auto" />
            <h1 className="text-2xl font-bold text-gray-900">Verifying Email...</h1>
            <p className="text-gray-600">Please wait while we verify your email address</p>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto" />
            <h1 className="text-2xl font-bold text-gray-900">Email Verified!</h1>
            <p className="text-gray-600">{message}</p>
            <p className="text-sm text-gray-500">
              {redirectScheduled ? 'Redirecting to login in a few seconds...' : 'Preparing redirect...'}
            </p>
            <a href="/login">
              <Button className="w-full mt-4">Go to Login Now</Button>
            </a>
          </>
        )}

        {status === 'error' && (
          <>
            <XCircle className="w-16 h-16 text-red-600 mx-auto" />
            <h1 className="text-2xl font-bold text-gray-900">Verification Failed</h1>
            <p className="text-gray-600">{message}</p>
            <div className="space-y-3">
              <a href="/verify-account">
                <Button className="w-full">Request New Verification Link</Button>
              </a>
              <a href="/login">
                <button className="w-full text-gray-600 hover:text-gray-900 underline">
                  Back to Login
                </button>
              </a>
            </div>
          </>
        )}
      </motion.div>
    </div>
  )
}

export default EmailVerificationPage
