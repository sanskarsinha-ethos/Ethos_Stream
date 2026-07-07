import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { supabase } from '../lib/supabaseClient'
import { useAuthStore } from '../store/authStore'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'

// Maps raw Supabase error codes/messages to human-readable UI strings
const AUTH_ERROR_MAP = {
  'Invalid login credentials':
    'Incorrect email or password. Please try again.',
  'Email not confirmed':
    'Your email address has not been confirmed. Check your inbox for a confirmation link.',
  'User not found':
    'No account found with this email address.',
  'Too many requests':
    'Too many login attempts. Please wait a few minutes before trying again.',
  'Network request failed':
    'Unable to reach authentication servers. Check your internet connection.',
}

const resolveErrorMessage = (error) => {
  if (!error) return 'An unexpected error occurred.'
  // Match against known message substrings
  const match = Object.keys(AUTH_ERROR_MAP).find((key) =>
    error.message?.includes(key)
  )
  return match ? AUTH_ERROR_MAP[match] : error.message ?? 'Login failed. Please try again.'
}

export default function LoginPage() {
  const navigate    = useNavigate()
  const setSession  = useAuthStore((s) => s.setSession)

  const [email,     setEmail]     = useState('')
  const [password,  setPassword]  = useState('')
  const [loading,   setLoading]   = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()

    // ── Payload sanitization ────────────────────────────────────────────────
    const sanitizedEmail    = email.trim().toLowerCase()
    const sanitizedPassword = password  // passwords must never be trimmed

    if (!sanitizedEmail || !sanitizedPassword) {
      toast.error('Email and password are both required.')
      return
    }

    if (!/\S+@\S+\.\S+/.test(sanitizedEmail)) {
      toast.error('Please enter a valid email address.')
      return
    }

    // ── Auth ingress dispatch ───────────────────────────────────────────────
    setLoading(true)

    if (import.meta.env.DEV) {
      console.group('%c[EthosStream] Auth ingress dispatch', 'color: #00E5CC')
      console.log('Endpoint: /auth/v1/token?grant_type=password')
      console.log('Instance: klxzihjdnpkogwuqcuau')
      console.log('Payload:', {
        email: sanitizedEmail,
        passwordLength: sanitizedPassword.length,
        passwordIsEmpty: sanitizedPassword.length === 0,
      })
      console.groupEnd()
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email:    sanitizedEmail,
        password: sanitizedPassword,
      })

      if (error) {
        // ── Structured error diagnostics ──────────────────────────────────
        console.error('%c[EthosStream] Auth ingress rejected', 'color: #EF4444', {
          status:         error.status,
          code:           error.code,
          name:           error.name,
          message:        error.message,
          rawError:       error,
        })

        // Surface human-readable message to UI
        toast.error(resolveErrorMessage(error), { duration: 6000 })
        return
      }

      // ── Successful auth handshake ─────────────────────────────────────────
      if (import.meta.env.DEV) {
        console.info('%c[EthosStream] Auth handshake successful', 'color: #10B981', {
          userId:    data.session?.user?.id,
          expiresAt: data.session?.expires_at,
        })
      }

      setSession(data.session)
      toast.success('Welcome back.')
      navigate('/profiles')

    } catch (unexpectedError) {
      // Catches network-level failures outside the Supabase response envelope
      console.error('[EthosStream] Unhandled auth exception:', unexpectedError)
      toast.error('A network error occurred. Check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/profiles`,
      },
    })
    if (error) {
      console.error('[EthosStream] Google OAuth error:', error)
      toast.error(error.message)
    }
  }

  return (
    <div className="min-h-screen bg-ethos-bg flex">

      {/* Left panel — cinematic brand */}
      <div className="hidden lg:flex w-1/2 relative items-center justify-center bg-ethos-surface overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-ethos-bg via-ethos-surface to-[#0d1f3c] opacity-90" />
        <div className="relative z-10 text-center px-12">
          <h1 className="font-space text-4xl font-bold text-ethos-white mb-4">
            Ethos<span className="text-ethos-teal">Stream</span>
          </h1>
          <p className="text-ethos-muted text-lg">Stream together, feel together.</p>
        </div>
      </div>

      {/* Right panel — login form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md"
        >
          <h2 className="font-space text-3xl font-bold text-ethos-white mb-2">
            Welcome back
          </h2>
          <p className="text-ethos-muted mb-8">Sign in to continue watching</p>

          <form onSubmit={handleLogin} className="space-y-4" noValidate>
            <Input
              label="Email address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              required
            />

            <div>
              <Input
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                required
              />
              <div className="text-right mt-1">
                <button
                  type="button"
                  className="text-ethos-teal text-sm hover:underline"
                  onClick={() => toast('Password reset coming soon.')}
                >
                  Forgot password?
                </button>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              loading={loading}
              disabled={loading}
            >
              Sign In
            </Button>
          </form>

          <div className="flex items-center my-6 gap-3">
            <div className="flex-1 h-px bg-ethos-border" />
            <span className="text-ethos-muted text-sm">or continue with</span>
            <div className="flex-1 h-px bg-ethos-border" />
          </div>

          <Button
            type="button"
            variant="ghost"
            size="lg"
            className="w-full"
            onClick={handleGoogleLogin}
            disabled={loading}
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </Button>

          <p className="text-center text-ethos-muted text-sm mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-ethos-teal hover:underline font-medium">
              Get started
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}
