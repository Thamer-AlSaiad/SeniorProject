import { motion } from 'framer-motion'
import { BadgeCheck } from 'lucide-react'
import { Button } from '../components/ui/button'
import picture5 from '../assets/Verified.svg'

const AccountVerifiedPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
      <div className="w-full max-w-7xl grid lg:grid-cols-2 gap-12 items-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center text-center space-y-6 max-w-lg mx-auto"
        >
          <h1 className="text-5xl font-bold text-gray-900">Account Verification</h1>
          <p className="text-gray-600 text-lg">your account has been verified</p>

          <BadgeCheck className="w-32 h-32 text-[#0D011C]" strokeWidth={2} />

          <p className="text-gray-600">
            Your account has been successfully verified.<br />
            You will be redirected to your profile
          </p>

          <a href="/profile">
            <Button className="min-w-[280px] h-14 text-base">
              Go to profile
            </Button>
          </a>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="hidden lg:flex justify-center"
        >
          <img
            src={picture5}
            alt="Account Verified"
            className="w-full max-w-md"
          />
        </motion.div>
      </div>
    </div>
  )
}

export default AccountVerifiedPage
