
import { motion } from "framer-motion";
import { Mail, ArrowLeft, CheckCircle } from "lucide-react";
import { useRouter } from 'next/router';

export default function VerifyEmail() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#1A1F2C]">
      <div className="max-w-7xl mx-auto px-6 py-24">
        <button 
          onClick={() => router.push('/')}
          className="flex text-lg items-center gap-2 text-accent hover:text-accent/80 transition-colors mb-8"
        >
          <ArrowLeft size={16} />
          Back to Home
        </button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="max-w-2xl mx-auto text-center"
        >
          <div className="bg-white/5 p-12 rounded-2xl backdrop-blur-lg border border-white/10">
            <div className="mb-8 flex justify-center">
              <div className="bg-accent/10 p-4 rounded-full">
                <Mail className="w-12 h-12 text-accent" />
              </div>
            </div>

            <h1 className="text-3xl font-semibold mb-4 text-white">
              Check Your Email
            </h1>
            
            <p className="text-gray-300 mb-8">
              We've sent a verification link to your email address. 
              Please click the link to verify your account.
            </p>

            <div className="space-y-6">
              <div className="bg-white/5 p-4 rounded-lg">
                <div className="flex items-center gap-3 text-sm text-gray-300">
                  <CheckCircle className="w-5 h-5 text-accent" />
                  <span>Check your spam folder if you don't see the email</span>
                </div>
              </div>

              <div className="bg-white/5 p-4 rounded-lg">
                <div className="flex items-center gap-3 text-sm text-gray-300">
                  <CheckCircle className="w-5 h-5 text-accent" />
                  <span>The link will expire in 24 hours</span>
                </div>
              </div>
            </div>

            <div className="mt-8 space-y-4">
              <button
                onClick={() => router.push('/login')}
                className="w-full bg-accent text-accent-foreground py-3 px-4 rounded-lg hover:opacity-90 transition-opacity"
              >
                Return to Login
              </button>
              
              <button
                onClick={() => window.location.reload()}
                className="w-full bg-white/10 text-white py-3 px-4 rounded-lg hover:bg-white/20 transition-colors"
              >
                Resend Verification Email
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
