import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { Activity, Lock, Mail } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import LoadingSpinner from '../components/LoadingSpinner'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [serverError, setServerError] = useState(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm()

  const onSubmit = async ({ email, password }) => {
    setServerError(null)
    try {
      await login(email, password)
      navigate('/')
    } catch (err) {
      const status = err.response?.status
      if (status === 401 || status === 400) {
        setServerError('Invalid email or password')
      } else {
        setServerError('Unable to connect. Please try again.')
      }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-slate-50 to-teal-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="bg-primary-600 text-white p-3 rounded-2xl shadow-lg mb-3">
            <Activity className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">PatientCare</h1>
          <p className="text-slate-500 text-sm mt-1">Patient Management System</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-8">
          <h2 className="text-xl font-semibold text-slate-800 mb-1">Welcome back</h2>
          <p className="text-slate-500 text-sm mb-6">Sign in to your account</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {serverError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2.5 rounded-lg text-sm">
                {serverError}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="email"
                  {...register('email', {
                    required: 'Email is required',
                    pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email' },
                  })}
                  className={`w-full pl-10 pr-3 py-2.5 rounded-lg border text-sm outline-none focus:ring-2 transition ${
                    errors.email
                      ? 'border-red-400 focus:ring-red-200'
                      : 'border-slate-200 focus:ring-primary-200 focus:border-primary-400'
                  }`}
                  placeholder="you@example.com"
                  autoComplete="email"
                />
              </div>
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="password"
                  {...register('password', { required: 'Password is required' })}
                  className={`w-full pl-10 pr-3 py-2.5 rounded-lg border text-sm outline-none focus:ring-2 transition ${
                    errors.password
                      ? 'border-red-400 focus:ring-red-200'
                      : 'border-slate-200 focus:ring-primary-200 focus:border-primary-400'
                  }`}
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
              </div>
              {errors.password && (
                <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 rounded-lg bg-primary-600 text-white font-semibold hover:bg-primary-700 transition flex items-center justify-center gap-2 disabled:opacity-60 mt-2"
            >
              {isSubmitting && <LoadingSpinner size="sm" />}
              Sign In
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
