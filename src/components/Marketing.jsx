import { useState, Suspense } from 'react'
import { Button, Input } from './ui'
import { HeroScene } from './HeroScene'
import { useTilt } from '../hooks/useTilt'
import { useNavigate } from 'react-router-dom'
import { isAuthenticated, registerAdmin, getUserContext } from '../services/storage'

// ── Landing Page ──────────────────────────────────────────────────────────────

function FeatureCard({ icon, title, body }) {
  const tilt = useTilt(8)
  return (
    <div
      ref={tilt.ref}
      onMouseMove={tilt.onMouseMove}
      onMouseLeave={tilt.onMouseLeave}
      className="p-5 rounded-[10px] border border-slate-200 bg-white hover:border-indigo-200 hover:shadow-lg group cursor-default"
      style={{ transformStyle: 'preserve-3d', willChange: 'transform' }}
    >
      <span className="text-2xl mb-3 block" style={{ transform: 'translateZ(20px)' }}>{icon}</span>
      <h3 className="font-semibold text-slate-900 font-display mb-2 group-hover:text-indigo-700" style={{ transform: 'translateZ(16px)' }}>{title}</h3>
      <p className="text-sm text-slate-500 leading-relaxed" style={{ transform: 'translateZ(8px)' }}>{body}</p>
    </div>
  )
}

export function LandingPage() {
  const navigate = useNavigate()
  return (
    <div className="min-h-screen bg-white overflow-hidden">
      {/* Nav */}
      <nav className="border-b border-slate-100 px-6 py-4 flex items-center justify-between max-w-7xl mx-auto relative z-10">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white text-sm font-bold">S</div>
          <span className="font-semibold text-slate-900 font-display">StoreKit</span>
        </div>
        <div className="hidden md:flex items-center gap-6 text-sm text-slate-500">
          <a href="#features" className="hover:text-slate-900">Features</a>
          <a href="#pricing" className="hover:text-slate-900">Pricing</a>
          <a href="#docs" className="hover:text-slate-900">Docs</a>
        </div>
        <div className="flex items-center gap-3">
          {isAuthenticated() ? (
            <Button size="sm" onClick={() => navigate('/admin')}>Dashboard</Button>
          ) : (
            <>
              <Button variant="ghost" size="sm" onClick={() => navigate('/admin/login')}>Login</Button>
              <Button size="sm" onClick={() => navigate('/signup')}>Sign up</Button>
            </>
          )}
        </div>
      </nav>

      {/* Hero — full width 3D canvas behind text */}
      <section className="relative min-h-[88vh] flex items-center overflow-hidden">
        {/* 3D canvas fills the right side / background */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute right-0 top-0 bottom-0 w-full lg:w-[60%]">
            <Suspense fallback={null}>
              <HeroScene />
            </Suspense>
          </div>
          {/* Gradient mask so text stays readable */}
          <div className="absolute inset-0 bg-gradient-to-r from-white via-white/90 via-50% to-transparent" />
        </div>

        {/* Text content */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 py-20">
          <span className="inline-flex items-center gap-2 text-xs font-mono font-medium text-indigo-700 bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-full mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
            Now in public beta
          </span>
          <h1 className="text-5xl lg:text-6xl font-bold text-slate-900 font-display leading-[1.08] tracking-tight mb-6 max-w-2xl">
            Your store,<br />your subdomain,<br />
            <span className="text-indigo-600">your rules.</span>
          </h1>
          <p className="text-lg text-slate-500 leading-relaxed mb-8 max-w-md">
            StoreKit gives every business a fully branded online store in minutes — no code, no servers, no complexity.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button size="lg" onClick={() => navigate('/signup')}>Create your store →</Button>
            <Button variant="secondary" size="lg" onClick={() => navigate('/store/demo')}>See a live store</Button>
          </div>
          <p className="text-xs text-slate-400 mt-4">Free for 14 days · No credit card required</p>

          {/* Floating stat pills */}
          <div className="flex flex-wrap gap-3 mt-10">
            {[
              { label: '4,200+ merchants', icon: '🏪' },
              { label: '$2.4M in sales', icon: '💰' },
              { label: '98% uptime', icon: '⚡' },
            ].map(s => (
              <div
                key={s.label}
                className="flex items-center gap-2 bg-white/80 backdrop-blur border border-slate-200 rounded-full px-4 py-2 text-sm font-medium text-slate-700 shadow-sm"
                style={{ animation: 'floatPill 3s ease-in-out infinite', animationDelay: `${Math.random() * 1.5}s` }}
              >
                <span>{s.icon}</span>{s.label}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="max-w-7xl mx-auto px-6 py-20 border-t border-slate-100">
        <p className="text-xs font-mono font-medium text-slate-400 uppercase tracking-widest mb-3">Platform features</p>
        <h2 className="text-3xl font-bold font-display text-slate-900 mb-12 max-w-xl">Everything you need to run a real online store</h2>
        <div className="grid md:grid-cols-3 gap-5" style={{ perspective: '1000px' }}>
          {[
            { icon: '🏪', title: 'Your own subdomain', body: 'Get yourstore.storekit.com instantly. Custom domains available on Pro plans.' },
            { icon: '📦', title: 'Product management', body: 'Add products with images, variants, stock levels, and rich descriptions in seconds.' },
            { icon: '📋', title: 'Order tracking', body: 'See every order in real-time. Update statuses from pending to delivered with one click.' },
            { icon: '📊', title: 'Sales analytics', body: 'Daily revenue charts, top-selling products, and conversion insights built in.' },
            { icon: '📱', title: 'Mobile-first storefront', body: 'Customers shop comfortably on any device. Your store looks great everywhere.' },
            { icon: '🚀', title: 'Zero infrastructure', body: 'No servers, no hosting bills. We handle scaling so you can focus on selling.' },
          ].map(f => <FeatureCard key={f.title} {...f} />)}
        </div>
      </section>

      {/* CTA */}
      <section className="relative bg-indigo-600 py-20 px-6 overflow-hidden">
        <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ height: 300 }}>
          <Suspense fallback={null}>
            <HeroScene />
          </Suspense>
        </div>
        <div className="relative z-10 max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold font-display text-white mb-4">Ready to launch your store?</h2>
          <p className="text-indigo-200 mb-8">Join 4,200+ merchants already selling with StoreKit.</p>
          <Button className="!bg-white !text-indigo-700 hover:!bg-indigo-50 !shadow-md" size="lg" onClick={() => navigate('/signup')}>
            Create your free store
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-100 px-6 py-8 max-w-7xl mx-auto flex items-center justify-between text-xs text-slate-400">
        <span>© 2026 StoreKit. All rights reserved.</span>
        <div className="flex gap-4">
          <a href="#" className="hover:text-slate-600">Privacy</a>
          <a href="#" className="hover:text-slate-600">Terms</a>
          <a href="#" className="hover:text-slate-600">Status</a>
        </div>
      </footer>

      <style>{`
        @keyframes floatPill {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-6px); }
        }
      `}</style>
    </div>
  )
}

// ── Signup Flow ───────────────────────────────────────────────────────────────

export function SignupFlow() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [biz, setBiz] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [subdomain, setSubdomain] = useState('')
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const slugify = (val) => val.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')

  const handleNext = async () => {
    if (step === 1) {
      const err = {}
      if (!biz) err.biz = 'Required'
      if (!email || !email.includes('@')) err.email = 'Valid email required'
      if (!password || password.length < 6) err.password = 'Min 6 characters'
      if (Object.keys(err).length > 0) return setErrors(err)
      setErrors({})
      setStep(2)
    } else if (step === 2) {
      if (!subdomain) return setErrors({ subdomain: 'Required' })
      setLoading(true)
      const res = await registerAdmin(email, password, biz, subdomain)
      setLoading(false)
      if (res.success) {
        setStep(3)
      } else {
        setErrors({ subdomain: res.error })
      }
    }
  }

  const steps = ['Business info', 'Choose subdomain', 'Done']

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Subtle 3D background */}
      <div className="absolute inset-0 pointer-events-none opacity-30">
        <Suspense fallback={null}><HeroScene /></Suspense>
      </div>
      <div className="absolute inset-0 bg-slate-50/70 pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center w-full">
        {/* Logo */}
        <div className="flex items-center gap-2 mb-10">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold">S</div>
          <span className="font-semibold text-slate-900 font-display text-lg">StoreKit</span>
        </div>

        {/* Step indicators */}
        <div className="flex items-center gap-2 mb-8">
          {steps.map((label, i) => (
            <div key={label} className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold font-mono
                ${i + 1 < step ? 'bg-indigo-600 text-white' : i + 1 === step ? 'bg-indigo-100 text-indigo-700 ring-2 ring-indigo-500' : 'bg-slate-200 text-slate-400'}`}>
                {i + 1 < step ? '✓' : i + 1}
              </div>
              <span className={`text-xs font-medium hidden sm:block ${i + 1 === step ? 'text-slate-900' : 'text-slate-400'}`}>{label}</span>
              {i < steps.length - 1 && <div className="w-8 h-px bg-slate-300 mx-1" />}
            </div>
          ))}
        </div>

        {/* Card */}
        <div
          className="bg-white/90 backdrop-blur border border-slate-200 rounded-[12px] shadow-sm w-full max-w-md p-8"
          style={{ animation: 'cardIn 0.3s cubic-bezier(0.34,1.56,0.64,1)' }}
        >
          {step === 1 && (
            <>
              <h1 className="text-2xl font-bold font-display text-slate-900 mb-1">Create your store</h1>
              <p className="text-sm text-slate-500 mb-6">Tell us about your business to get started.</p>
              <div className="flex flex-col gap-4">
                <Input label="Business name" placeholder="Acme Goods Co." value={biz}
                  onChange={e => { setBiz(e.target.value); setSubdomain(slugify(e.target.value)) }} error={errors.biz} />
                <Input label="Email address" type="email" placeholder="you@yourbusiness.com" value={email}
                  onChange={e => setEmail(e.target.value)} error={errors.email} />
                <Input label="Password" type="password" placeholder="Create a password" value={password}
                  onChange={e => setPassword(e.target.value)} error={errors.password} />
                <Button className="w-full mt-2" onClick={handleNext}>Continue →</Button>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <h1 className="text-2xl font-bold font-display text-slate-900 mb-1">Pick your subdomain</h1>
              <p className="text-sm text-slate-500 mb-6">This is where customers will find your store.</p>
              <div className="flex flex-col gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-1.5">Subdomain</label>
                  <div className="flex rounded-[10px] border border-slate-200 overflow-hidden focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20">
                    <input className="flex-1 px-3.5 py-2.5 text-sm outline-none bg-white text-slate-900" placeholder="yourstore"
                      value={subdomain} onChange={e => { setSubdomain(slugify(e.target.value)); setErrors({}) }} />
                    <span className="px-3 flex items-center text-sm text-slate-400 bg-slate-50 border-l border-slate-200 font-mono">.storekit.com</span>
                  </div>
                  {errors.subdomain && <p className="text-xs text-red-500 mt-1">⚠ {errors.subdomain}</p>}
                </div>
                {subdomain && (
                  <div className="bg-indigo-50 border border-indigo-100 rounded-[10px] p-4">
                    <p className="text-xs text-indigo-500 font-mono mb-2">Preview URL</p>
                    <p className="text-sm font-semibold text-indigo-800 break-all font-mono">{subdomain}.storekit.com</p>
                    <div className="flex items-center gap-1.5 mt-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                      <span className="text-xs text-green-700">Subdomain available</span>
                    </div>
                  </div>
                )}
                <div className="flex gap-3 mt-2">
                  <Button variant="secondary" className="flex-1" onClick={() => setStep(1)} disabled={loading}>← Back</Button>
                  <Button className="flex-1" onClick={handleNext} disabled={loading}>{loading ? 'Creating...' : 'Create store →'}</Button>
                </div>
              </div>
            </>
          )}

          {step === 3 && (
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-3xl mx-auto mb-4"
                style={{ animation: 'bounceIn 0.5s cubic-bezier(0.34,1.56,0.64,1)' }}>🎉</div>
              <h1 className="text-2xl font-bold font-display text-slate-900 mb-2">Your store is live!</h1>
              <p className="text-sm text-slate-500 mb-2">Welcome to StoreKit, <strong>{biz}</strong>.</p>
              <p className="text-sm font-mono text-indigo-700 bg-indigo-50 rounded-lg px-3 py-2 inline-block mb-6">{subdomain}.storekit.com</p>
              <div className="flex flex-col gap-3">
                <Button className="w-full" onClick={() => navigate('/admin')}>Go to your dashboard →</Button>
                <div className="pt-2">
                  <Button variant="ghost" className="w-full" onClick={() => navigate(getUserContext() ? `/store/${getUserContext()?.subdomain || 'demo'}` : '/store/demo')}>View your store</Button>
                </div>
              </div>
            </div>
          )}
        </div>

        <p className="text-xs text-slate-400 mt-6 relative z-10">
          Already have an account?{' '}
          <button onClick={() => navigate('/admin')} className="text-indigo-600 hover:underline">Sign in</button>
        </p>
      </div>

      <style>{`
        @keyframes cardIn { from { opacity:0; transform:translateY(20px) scale(0.96) } to { opacity:1; transform:translateY(0) scale(1) } }
        @keyframes bounceIn { from { opacity:0; transform:scale(0.5) } to { opacity:1; transform:scale(1) } }
      `}</style>
    </div>
  )
}
