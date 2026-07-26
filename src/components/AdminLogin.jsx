import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Button, Input } from './ui'
import { loginAdmin } from '../services/storage'

export function AdminLogin({ onLoginSuccess }) {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    setTimeout(() => {
      const res = loginAdmin(username, password)
      setLoading(false)
      if (res.success) {
        if (onLoginSuccess) onLoginSuccess()
        navigate('/admin')
      } else {
        setError(res.error)
      }
    }, 400)
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-6 transition-colors">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md"
      >
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl p-8 transition-colors">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold text-lg">
                ⚡
              </div>
              <div>
                <h1 className="text-xl font-bold font-display text-slate-900 dark:text-white leading-none">
                  StoreKit Admin
                </h1>
                <p className="text-xs text-slate-400 dark:text-slate-500 font-mono mt-1">
                  Management Console
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate('/store')}
              className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer"
            >
              ← Back to store
            </button>
          </div>

          {/* Demo Login Credentials Helper */}
          <div className="bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 rounded-xl p-3.5 mb-6 text-xs text-indigo-900 dark:text-indigo-300">
            <p className="font-semibold mb-1 flex items-center gap-1.5">
              <span>💡</span> Demo Admin Credentials:
            </p>
            <div className="font-mono text-[11px] space-y-0.5 opacity-90">
              <p>Username: <span className="font-bold underline">admin</span></p>
              <p>Password: <span className="font-bold underline">admin123</span></p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Username"
              type="text"
              placeholder="Enter username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />

            <Input
              label="Password"
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            {error && (
              <motion.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xs text-red-500 font-medium flex items-center gap-1 mt-1"
              >
                <span>⚠️</span> {error}
              </motion.p>
            )}

            <Button
              type="submit"
              className="w-full mt-2"
              size="lg"
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign in to Dashboard →'}
            </Button>
          </form>
        </div>
      </motion.div>
    </div>
  )
}
