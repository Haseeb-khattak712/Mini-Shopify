import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Button, Input } from '@/components/ui/ui'
import { login, getUserContext, getSavedAccounts, switchAccount } from '@/services/storage'

export function AdminLogin({ onLoginSuccess }) {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  
  const [savedAccounts, setSavedAccounts] = useState([])
  const [showChooser, setShowChooser] = useState(false)

  useEffect(() => {
    const accounts = getSavedAccounts()
    if (accounts && accounts.length > 0) {
      setSavedAccounts(accounts)
      setShowChooser(true)
    }
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const res = await login(email, password)
    setLoading(false)
    if (res.success) {
      handleSuccessfulRouting()
    } else {
      setError(res.error)
    }
  }

  const handleAccountSelect = (user) => {
    switchAccount(user)
    handleSuccessfulRouting()
  }

  const handleSuccessfulRouting = () => {
    if (onLoginSuccess) onLoginSuccess()
    const user = getUserContext()
    if (user?.role === 'admin') {
      navigate('/admin')
    } else {
      navigate('/account')
    }
  }

  return (
    <div className="min-h-screen bg-[#000504] flex items-center justify-center p-6 transition-colors">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md"
      >
        <div className="bg-[#021612] border border-white/10 rounded-2xl shadow-xl p-8 transition-colors">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3 cursor-pointer group" onClick={() => window.location.href = '/'} style={{ perspective: '1000px' }}>
              <img src="/logo.png" alt="OwnStore Logo" className="w-10 h-10 object-contain drop-shadow-md opacity-80 mix-blend-luminosity group-hover:mix-blend-normal group-hover:opacity-100 transition-all duration-500" style={{ transition: 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)', transformStyle: 'preserve-3d' }} onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.15) rotateY(15deg) rotateX(10deg) translateZ(10px)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1) rotateY(0deg) rotateX(0deg) translateZ(0px)'} />
              <div>
                <h1 className="text-2xl font-black font-logo text-shop-accent tracking-tighter leading-none transition-colors duration-300">
                  OwnStore
                </h1>
                <p className="text-xs text-white/50 font-mono mt-1 group-hover:text-white/70 transition-colors duration-300">
                  Welcome back
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate('/')}
              className="text-xs text-white/60 hover:text-white/90 transition-colors cursor-pointer"
            >
              ← Back to website
            </button>
          </div>

          <AnimatePresence mode="wait">
            {showChooser ? (
              <motion.div
                key="chooser"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-4"
              >
                <h2 className="text-white font-medium mb-4 text-center">Choose an account</h2>
                <div className="space-y-2">
                  {savedAccounts.map((acc, idx) => (
                    <div
                      key={idx}
                      onClick={() => handleAccountSelect(acc)}
                      className="p-4 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 hover:border-shop-accent/30 cursor-pointer transition-all flex items-center gap-4 group"
                    >
                      <div className="w-10 h-10 rounded-full bg-shop-accent/20 text-shop-accent flex items-center justify-center font-bold text-lg border border-shop-accent/30 group-hover:scale-105 transition-transform">
                        {acc.name ? acc.name.charAt(0).toUpperCase() : acc.email.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-white font-medium truncate">{acc.name || 'User'}</h3>
                        <p className="text-white/50 text-xs truncate">{acc.email}</p>
                      </div>
                      <div className="text-shop-accent opacity-0 group-hover:opacity-100 transition-opacity">
                        →
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="pt-4 border-t border-white/10 mt-6">
                  <button
                    onClick={() => setShowChooser(false)}
                    className="w-full py-3 px-4 rounded-xl text-white/70 hover:bg-white/5 hover:text-white transition-colors flex items-center justify-center gap-2 text-sm font-medium"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add another account
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.form
                key="login"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onSubmit={handleSubmit}
                className="space-y-4"
              >
                <Input
                  label="Email Address"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
                  {loading ? 'Signing in...' : 'Sign in →'}
                </Button>
                
                {savedAccounts.length > 0 && (
                  <div className="pt-4 text-center">
                    <button
                      type="button"
                      onClick={() => setShowChooser(true)}
                      className="text-xs text-shop-accent hover:text-white transition-colors"
                    >
                      ← Back to saved accounts
                    </button>
                  </div>
                )}
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  )
}
