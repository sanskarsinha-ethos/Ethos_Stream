import { useState, FormEvent } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Circle, Eye, EyeOff } from 'lucide-react'
import { supabase } from './lib/supabaseClient'

const CINEMA_VIDEO_SRC =
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260506_081238_406ed0e3-5d83-436e-a512-0bbff7ec5b95.mp4'

function GoogleIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  )
}

export default function App() {
  const [isLoginMode, setIsLoginMode] = useState(false)
  const [firstName, setFirstName]     = useState('')
  const [lastName, setLastName]       = useState('')
  const [email, setEmail]             = useState('')
  const [password, setPassword]       = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading]         = useState(false)
  const [error, setError]             = useState<string | null>(null)
  const [success, setSuccess]         = useState<string | null>(null)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setLoading(true)

    const sanitizedEmail = email.trim().toLowerCase()

    try {
      if (isLoginMode) {
        const { error: authError } = await supabase.auth.signInWithPassword({
          email: sanitizedEmail,
          password,
        })
        if (authError) throw authError
        setSuccess('Authentication successful! Initializing space...')
      } else {
        const { error: authError } = await supabase.auth.signUp({
          email: sanitizedEmail,
          password,
          options: {
            data: {
              first_name: firstName.trim(),
              last_name: lastName.trim(),
            },
          },
        })
        if (authError) throw authError
        setSuccess('Account successfully generated! Checking keys...')
      }
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'An unhandled exception occurred within the ingress pipeline.'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleAuth = async () => {
    const { error: authError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/` },
    })
    if (authError) setError(authError.message)
  }

  return (
    <div className="flex min-h-screen w-full bg-black selection:bg-white/30 p-2 transition-all duration-500 lg:h-screen lg:overflow-hidden lg:p-4">

      {/* ── Left Column — Cinema Viewport Anchor ─────────────── */}
      <div className="hidden lg:flex w-[52%] relative rounded-2xl overflow-hidden shadow-2xl h-full">
        <video
          className="absolute inset-0 w-full h-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          src={CINEMA_VIDEO_SRC}
        />

        <div className="relative z-10 flex flex-col justify-between w-full h-full p-10">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <Circle className="w-5 h-5 fill-white text-white" />
            <span className="tracking-tight text-white font-semibold text-lg">
              Ethos Stream
            </span>
          </div>

          {/* Hero text + stepper */}
          <div>
            <h1 className="text-white text-5xl font-bold uppercase tracking-tight mb-3">
              Join Ethos Stream
            </h1>
            <p className="text-white/80 whitespace-nowrap text-base pr-4">
              Set up your profile to host real-time cinema rooms.
            </p>

            <div className="flex flex-col gap-3 mt-8 max-w-sm">
              {/* Step 1 — Active */}
              <div className="flex items-center gap-4 w-full p-4 rounded-xl bg-white text-black border border-white">
                <div className="w-7 h-7 rounded-full bg-black text-white flex items-center justify-center text-xs font-semibold">
                  1
                </div>
                <span className="text-sm font-medium tracking-tight truncate">Stream videos</span>
              </div>

              {/* Step 2 — Inactive */}
              <div className="flex items-center gap-4 w-full p-4 rounded-xl bg-[#1A1A1A] text-white">
                <div className="w-7 h-7 rounded-full bg-white/10 text-white/40 flex items-center justify-center text-xs font-semibold">
                  2
                </div>
                <span className="text-sm font-medium tracking-tight truncate">
                  Initialize 4-player party studio
                </span>
              </div>
            </div>
          </div>

          {/* Bottom spacer */}
          <div />
        </div>
      </div>

      {/* ── Right Column — Authentication Form Canvas ────────── */}
      <div className="flex-1 flex flex-col items-center justify-center bg-black px-6 overflow-y-auto lg:overflow-hidden">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-sm space-y-6"
        >
          {/* Header */}
          <div>
            <AnimatePresence mode="wait">
              <motion.h2
                key={isLoginMode ? 'login' : 'register'}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.25 }}
                className="text-white text-3xl font-medium tracking-tight"
              >
                {isLoginMode ? 'Welcome Back' : 'Create Viewer Account'}
              </motion.h2>
            </AnimatePresence>
          </div>

          {/* Google OAuth */}
          <button
            type="button"
            onClick={handleGoogleAuth}
            className="w-full flex items-center justify-center gap-3 bg-black border border-white/10 text-white font-medium rounded-xl py-3 hover:bg-white/5 transition-all text-sm cursor-pointer"
          >
            <GoogleIcon />
            Continue with Google
          </button>

          {/* Divider */}
          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-white/10" />
            <span className="mx-4 text-xs text-white/40 uppercase tracking-widest">or gateway</span>
            <div className="flex-grow border-t border-white/10" />
          </div>

          {/* Error / Success feedback */}
          {error && (
            <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
              {error}
            </div>
          )}
          {success && (
            <div className="text-sm text-green-400 bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-3">
              {success}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* First / Last Name — registration only */}
            <AnimatePresence initial={false}>
              {!isLoginMode && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.25 }}
                  className="grid grid-cols-2 gap-3 overflow-hidden"
                >
                  <div className="flex flex-col space-y-1.5 w-full">
                    <label className="text-sm font-medium text-white">First Name</label>
                    <input
                      type="text"
                      placeholder="Alex"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required={!isLoginMode}
                      className="bg-[#1A1A1A] border-none rounded-xl h-11 px-4 text-white placeholder:text-white/20 focus:ring-2 focus:ring-white/20 transition-all outline-none"
                    />
                  </div>
                  <div className="flex flex-col space-y-1.5 w-full">
                    <label className="text-sm font-medium text-white">Last Name</label>
                    <input
                      type="text"
                      placeholder="Vane"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required={!isLoginMode}
                      className="bg-[#1A1A1A] border-none rounded-xl h-11 px-4 text-white placeholder:text-white/20 focus:ring-2 focus:ring-white/20 transition-all outline-none"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Email */}
            <div className="flex flex-col space-y-1.5 w-full">
              <label className="text-sm font-medium text-white">Email Address</label>
              <input
                type="email"
                placeholder="viewer@ethosstream.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-[#1A1A1A] border-none rounded-xl h-11 px-4 text-white placeholder:text-white/20 focus:ring-2 focus:ring-white/20 transition-all outline-none"
              />
            </div>

            {/* Password */}
            <div className="flex flex-col space-y-1.5 w-full">
              <label className="text-sm font-medium text-white">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full bg-[#1A1A1A] border-none rounded-xl h-11 pl-4 pr-11 text-white placeholder:text-white/20 focus:ring-2 focus:ring-white/20 transition-all outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-14 bg-white text-black font-semibold rounded-xl hover:bg-white/90 active:scale-[0.98] transition-all disabled:opacity-50 mt-4 cursor-pointer"
            >
              {loading ? 'Please wait…' : isLoginMode ? 'Sign In' : 'Initialize Profile'}
            </button>
          </form>

          {/* Mode toggle footer */}
          <p className="text-center text-white/50 text-sm mt-6">
            {isLoginMode ? (
              <>
                New here?{' '}
                <button
                  onClick={() => {
                    setIsLoginMode(false)
                    setError(null)
                    setSuccess(null)
                  }}
                  className="text-white font-semibold underline underline-offset-2 cursor-pointer"
                >
                  Create an account
                </button>
              </>
            ) : (
              <>
                Existing user?{' '}
                <button
                  onClick={() => {
                    setIsLoginMode(true)
                    setError(null)
                    setSuccess(null)
                  }}
                  className="text-white font-semibold underline underline-offset-2 cursor-pointer"
                >
                  Log in
                </button>
              </>
            )}
          </p>
        </motion.div>
      </div>
    </div>
  )
}
