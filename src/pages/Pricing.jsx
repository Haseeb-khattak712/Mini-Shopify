import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate, Link } from 'react-router-dom'
import { Button } from '@/components/ui/ui'
import { isAuthenticated, isAdmin } from '@/services/storage'

const StackingWrapper = ({ children, className, zIndex }) => {
  const ref = useRef(null);
  const [topOffset, setTopOffset] = useState(72);

  useEffect(() => {
    const updateOffset = () => {
      if (ref.current) {
        const height = ref.current.offsetHeight;
        const windowHeight = window.innerHeight;
        setTopOffset(Math.min(72, windowHeight - height));
      }
    };
    
    updateOffset();
    const observer = new ResizeObserver(updateOffset);
    if (ref.current) observer.observe(ref.current);
    
    window.addEventListener('resize', updateOffset);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', updateOffset);
    };
  }, []);

  return (
    <div 
      ref={ref}
      className={`relative md:sticky w-full flex flex-col md:top-[var(--sticky-top)] ${className}`}
      style={{ '--sticky-top': `${topOffset}px`, zIndex }}
    >
      {children}
    </div>
  );
};

const plans = [
  {
    name: 'Basic',
    price: '$19',
    description: 'For individuals and small teams.',
    features: ['Up to 1,000 products', 'Basic analytics', 'Standard support', '2 staff accounts']
  },
  {
    name: 'Pro',
    price: '$49',
    description: 'For growing businesses.',
    features: ['Up to 10,000 products', 'Advanced analytics', 'Priority support', '5 staff accounts', 'Abandoned cart recovery'],
    popular: true
  },
  {
    name: 'Plus',
    price: '$99',
    description: 'For scaling operations.',
    features: ['Unlimited products', 'Custom reports', '24/7 phone support', '15 staff accounts', 'Advanced workflow automation']
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    description: 'For high-volume brands.',
    features: ['Headless commerce', 'Dedicated success manager', 'Unlimited staff accounts', 'Custom APIs & integrations', '99.99% uptime SLA']
  }
]

const faqs = [
  { question: "Can I cancel my account at any time?", answer: "Yes, you can cancel your subscription at any time. If you cancel within your 7-day free trial, you won't be charged." },
  { question: "Do I need a credit card to sign up?", answer: "No, you don't need a credit card to start your 7-day free trial. We only ask for payment details when you're ready to pick a paid plan." },
  { question: "Can I change my plan later?", answer: "Absolutely. You can upgrade or downgrade your plan at any time right from your dashboard." },
  { question: "What happens after the $1 for 2 months promo?", answer: "After your promotional period ends, you will be billed at the standard monthly rate for the plan you selected." },
]

export function Pricing() {
  const navigate = useNavigate()
  const [navVisible, setNavVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)
  const [openFaq, setOpenFaq] = useState(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setNavVisible(false)
      } else {
        setNavVisible(true)
      }
      setLastScrollY(currentScrollY)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [lastScrollY])

  const staggerContainer = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  }

  const flipCard = {
    hidden: { opacity: 0, x: 100, rotateY: 90 },
    show: { 
      opacity: 1, x: 0, rotateY: 0,
      transition: { type: "spring", stiffness: 60, damping: 15, duration: 0.8 }
    }
  }

  const slideUp = {
    hidden: { opacity: 0, y: 100 },
    show: { 
      opacity: 1, y: 0,
      transition: { type: "spring", stiffness: 50, damping: 20, duration: 1 }
    }
  }

  return (
    <div className="bg-zinc-950 font-body text-white selection:bg-shop-accent selection:text-shop-primary">
      {/* Shared Nav */}
      <nav className={`sticky top-0 left-0 right-0 z-[100] bg-[#000000]/90 backdrop-blur-xl border-b border-white/5 py-4 transition-all duration-700 ${navVisible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0 pointer-events-none'}`}>
        <div className="mx-auto max-w-[1728px] px-6 md:px-10 lg:px-16 xl:px-20 2xl:px-24 w-full flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate('/')} style={{ perspective: '1000px' }}>
            <img src="/logo.png" alt="OwnStore Logo" className="w-10 h-10 object-contain drop-shadow-md opacity-80 mix-blend-luminosity group-hover:mix-blend-normal group-hover:opacity-100 transition-all duration-500" style={{ transition: 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)', transformStyle: 'preserve-3d' }} onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.15) rotateY(15deg) rotateX(10deg) translateZ(10px)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1) rotateY(0deg) rotateX(0deg) translateZ(0px)'} />
            <span className="font-black text-shop-accent font-logo text-2xl tracking-tighter transition-colors duration-300">OwnStore</span>
          </div>
          <div className="hidden md:flex items-center gap-8 font-medium text-white/80 text-sm">
            <a href="/#platform" className="hover:text-white transition-colors">Platform</a>
            <a href="/#customization" className="hover:text-white transition-colors">Customization</a>
            <a href="/#checkout" className="hover:text-white transition-colors">Checkout</a>
            <Link to="/pricing" className="hover:text-white text-shop-accent font-semibold transition-colors">Pricing</Link>
            <Link to="/marketplace" className="hover:text-white transition-colors">Marketplace</Link>
          </div>
          <div className="flex items-center gap-3">
            {isAuthenticated() ? (
              <div className="hidden md:flex items-center gap-3">
                <Button variant="ghost" size="sm" onClick={() => navigate('/login')} className="hover:!bg-white/10 font-medium text-white">Switch Account</Button>
                <Button size="sm" onClick={() => navigate(isAdmin() ? '/admin' : '/account')} className="!bg-zinc-100 hover:!bg-white !text-zinc-900 hover:scale-105 transition-all">{isAdmin() ? 'Dashboard' : 'Account'}</Button>
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-3">
                <Button variant="ghost" size="sm" onClick={() => navigate('/login')} className="hover:!bg-white/10 font-medium text-white">Log in</Button>
                <Button size="sm" onClick={() => navigate('/signup')} className="!bg-gradient-to-br from-shop-accent/10 to-transparent border border-shop-accent/20 shadow-[0_30px_60px_rgba(149,191,71,0.15)] backdrop-blur-md hover:!bg-gradient-to-br from-shop-accent/10 to-transparent border border-shop-accent/20 shadow-[0_30px_60px_rgba(149,191,71,0.15)] backdrop-blur-md/90 text-white hover:scale-105 transition-all shadow-md shadow-shop-primary/20">Start Free</Button>
              </div>
            )}
            {/* Mobile Menu Toggle */}
            <button className="md:hidden text-white p-2" onClick={() => setMobileMenuOpen(true)}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-0 left-0 w-full h-screen bg-zinc-950/95 backdrop-blur-2xl z-50 flex flex-col p-6 md:hidden"
            >
              <div className="flex justify-end mb-8">
                <button className="text-white p-2" onClick={() => setMobileMenuOpen(false)}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                </button>
              </div>
              <div className="flex flex-col gap-6 text-2xl font-display font-medium text-white/90">
                <a href="/#platform" onClick={() => setMobileMenuOpen(false)} className="hover:text-white transition-colors">Platform</a>
                <a href="/#customization" onClick={() => setMobileMenuOpen(false)} className="hover:text-white transition-colors">Customization</a>
                <a href="/#checkout" onClick={() => setMobileMenuOpen(false)} className="hover:text-white transition-colors">Checkout</a>
                <Link to="/pricing" onClick={() => setMobileMenuOpen(false)} className="text-shop-accent transition-colors">Pricing</Link>
                <Link to="/marketplace" onClick={() => setMobileMenuOpen(false)} className="hover:text-white transition-colors">Marketplace</Link>
              </div>
              <div className="mt-auto flex flex-col gap-4">
                {isAuthenticated() ? (
                  <>
                    <Button onClick={() => navigate(isAdmin() ? '/admin' : '/account')} className="w-full !bg-zinc-100 !text-zinc-900 py-6 text-lg">{isAdmin() ? 'Dashboard' : 'Account'}</Button>
                    <Button variant="outline" onClick={() => navigate('/login')} className="w-full text-white border-white/20 py-6 text-lg">Switch Account</Button>
                  </>
                ) : (
                  <>
                    <Button onClick={() => navigate('/signup')} className="w-full !bg-shop-accent !text-shop-primary py-6 text-lg">Start Free Trial</Button>
                    <Button variant="outline" onClick={() => navigate('/login')} className="w-full text-white border-white/20 py-6 text-lg">Log in</Button>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* WRAPPER 1: Hero & Cards */}
      <StackingWrapper zIndex={10} className="md:min-h-[calc(100vh-72px)] bg-zinc-950 pt-8 pb-32">
        <div className="flex-1 w-full max-w-[1400px] mx-auto px-6">
          
          {/* Hero Section */}
          <div className="text-center mb-32">
            <motion.h1 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="text-5xl md:text-7xl font-bold font-display tracking-tight mb-6"
            >
              You've got plans, <span className="text-shop-accent">us too</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.2 }}
              className="text-xl md:text-2xl text-white/70 font-light mb-8"
            >
              Try <strong className="text-white">7 days for free</strong> then $1/month for 2 months
            </motion.p>

            <motion.div 
              variants={staggerContainer}
              initial="hidden"
              animate="show"
              className="flex overflow-x-auto gap-4 md:gap-6 pt-8 pb-8 px-2 snap-x snap-mandatory perspective-[2000px] w-full hide-scrollbar"
            >
              {plans.map((plan, i) => (
                <motion.div 
                  key={plan.name}
                  variants={flipCard}
                  className={`relative shrink-0 w-[85vw] sm:w-[320px] md:w-[340px] lg:flex-1 snap-center bg-zinc-900/50 border ${plan.popular ? 'border-shop-accent shadow-[0_0_30px_rgba(255,255,255,0.15)]' : 'border-white/10'} rounded-3xl p-8 text-left flex flex-col hover:-translate-y-2 transition-transform duration-300`}
                >
                  {plan.popular && (
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-shop-accent text-zinc-950 px-4 py-1 rounded-full text-xs font-bold tracking-widest uppercase">
                      Most Popular
                    </div>
                  )}
                  <h3 className="text-2xl font-bold font-display mb-2">{plan.name}</h3>
                  <p className="text-white/50 text-sm h-10">{plan.description}</p>
                  <div className="my-6">
                    <span className="text-4xl font-black font-display">{plan.price}</span>
                    {plan.price !== 'Custom' && <span className="text-white/50">/mo</span>}
                  </div>
                  <Button 
                    className={`w-full mb-8 ${plan.popular ? '!bg-shop-accent !text-zinc-950 hover:!bg-shop-accent/90' : '!bg-white/10 hover:!bg-white/20'}`}
                    onClick={() => navigate('/signup')}
                  >
                    Start Free Trial
                  </Button>
                  <div className="flex-1">
                    <p className="text-xs font-bold text-white/40 uppercase tracking-wider mb-4">What's included</p>
                    <ul className="space-y-3">
                      {plan.features.map(f => (
                        <li key={f} className="flex items-start gap-3 text-sm text-white/80">
                          <svg className="w-5 h-5 text-shop-accent shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </StackingWrapper>

      {/* WRAPPER 2: Always Included & POS Pack (Slides over Wrapper 1) */}
      <StackingWrapper zIndex={20} className="md:min-h-[calc(100vh-72px)] bg-zinc-950 rounded-t-[3rem] shadow-[0_-30px_60px_rgba(0,0,0,0.8)] border-t border-white/5 pt-20 pb-32">
        <div className="flex-1 w-full max-w-[1400px] mx-auto px-6">
          <motion.div 
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
            variants={slideUp}
          >
            <div className="text-center mb-20">
              <h2 className="text-4xl md:text-5xl font-bold font-display mb-6">Always Included</h2>
              <p className="text-lg text-white/60 max-w-2xl mx-auto">Every OwnStore plan comes packed with powerful tools to help you run your business, completely free of charge.</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-12 text-center mb-32">
              <div className="flex flex-col items-center">
                <div className="w-32 h-32 mb-8 relative rounded-full bg-shop-accent/5 flex items-center justify-center p-4 border border-shop-accent/20 shadow-[0_0_40px_rgba(255,255,255,0.1)]">
                  <img src="/assets/support_icon.png" alt="24/7 Support" className="w-full h-full object-contain mix-blend-screen" />
                </div>
                <h3 className="text-xl font-bold mb-3">24/7 Global Support</h3>
                <p className="text-white/60 text-sm">Award-winning customer service available around the clock via live chat, email, and phone.</p>
              </div>
              
              <div className="flex flex-col items-center">
                <div className="w-32 h-32 mb-8 relative rounded-full bg-shop-accent/5 flex items-center justify-center p-4 border border-shop-accent/20 shadow-[0_0_40px_rgba(255,255,255,0.1)]">
                  <img src="/assets/checkout_icon.png" alt="World's Best Checkout" className="w-full h-full object-contain mix-blend-screen" />
                </div>
                <h3 className="text-xl font-bold mb-3">World's Best Checkout</h3>
                <p className="text-white/60 text-sm">Our highly optimized, one-click checkout converts 36% better than the industry average.</p>
              </div>

              <div className="flex flex-col items-center">
                <div className="w-32 h-32 mb-8 relative rounded-full bg-shop-accent/5 flex items-center justify-center p-4 border border-shop-accent/20 shadow-[0_0_40px_rgba(255,255,255,0.1)]">
                  <img src="/assets/global_icon.png" alt="Global Reach" className="w-full h-full object-contain mix-blend-screen" />
                </div>
                <h3 className="text-xl font-bold mb-3">Global Infrastructure</h3>
                <p className="text-white/60 text-sm">Sell anywhere with localized currencies, languages, and 99.99% proven uptime SLA.</p>
              </div>
            </div>

            <div className="text-center">
              <span className="bg-shop-accent/10 text-shop-accent px-4 py-1.5 rounded-full text-sm font-bold tracking-widest uppercase mb-6 inline-block border border-shop-accent/20">Omnichannel Bundle</span>
              <h2 className="text-4xl md:text-6xl font-bold font-display tracking-tight mb-16">But wait, <span className="text-shop-accent">there is more!</span></h2>
              
              <div className="max-w-4xl mx-auto bg-zinc-900/50 border border-shop-accent/30 rounded-3xl p-8 md:p-12 text-left flex flex-col md:flex-row items-center gap-12 shadow-[0_30px_60px_rgba(255,255,255,0.1)]">
                <div className="flex-1">
                  <h3 className="text-3xl font-bold font-display mb-4 text-white">Special POS Pack</h3>
                  <p className="text-white/70 text-lg mb-6 leading-relaxed">Bridge the gap between online and in-person sales. Get our flagship Point of Sale software included free with the Pro and Plus plans.</p>
                  <ul className="space-y-4 mb-8">
                    <li className="flex items-center gap-3 text-white/90">
                      <svg className="w-5 h-5 text-shop-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                      Unified inventory management
                    </li>
                    <li className="flex items-center gap-3 text-white/90">
                      <svg className="w-5 h-5 text-shop-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                      Omnichannel customer profiles
                    </li>
                    <li className="flex items-center gap-3 text-white/90">
                      <svg className="w-5 h-5 text-shop-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                      Advanced staff permission controls
                    </li>
                  </ul>
                  <Button className="!bg-shop-accent !text-zinc-950 hover:!bg-shop-accent/90" onClick={() => navigate('/signup')}>Add to Plan</Button>
                </div>
                <div className="w-full md:w-1/2 flex justify-center relative">
                  <div className="absolute inset-0 bg-shop-accent/20 blur-[100px] rounded-full"></div>
                  <img src="/assets/pos_icon.png" alt="POS System" className="w-64 h-64 object-contain mix-blend-screen relative z-10 animate-float" />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </StackingWrapper>

      {/* WRAPPER 3: Feature Matrix */}
      <StackingWrapper zIndex={30} className="md:min-h-[calc(100vh-72px)] bg-[#f4f6f8] text-zinc-900 rounded-t-[3rem] shadow-[0_-30px_60px_rgba(0,0,0,0.8)] border-t border-black/5 py-20">
        <motion.div 
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          variants={slideUp}
          className="w-full max-w-[1200px] mx-auto px-6 flex-1"
        >
          <div className="text-center mb-16">
            <span className="bg-zinc-900/10 text-zinc-900 px-4 py-1.5 rounded-full text-sm font-bold tracking-widest uppercase mb-6 inline-block border border-zinc-900/20">Detailed Comparison</span>
            <h2 className="text-4xl md:text-5xl font-bold font-display tracking-tight">Feature Matrix</h2>
          </div>

          <div className="overflow-x-auto pb-8">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="sticky top-[72px] z-[90] bg-[#f4f6f8]/80 backdrop-blur-md shadow-sm border-b border-black/10">
                  <th className="p-6 w-1/3"></th>
                  <th className="p-6 text-xl font-bold font-display">Basic</th>
                  <th className="p-6 text-xl font-bold font-display text-zinc-900">Pro</th>
                  <th className="p-6 text-xl font-bold font-display">Plus</th>
                </tr>
              </thead>
              <tbody className="text-zinc-800">
                <tr className="hover:bg-black/5 transition-colors">
                  <td className="p-6 border-b border-black/10 font-medium">Online Store</td>
                  <td className="p-6 border-b border-black/10">✓</td>
                  <td className="p-6 border-b border-black/10">✓</td>
                  <td className="p-6 border-b border-black/10">✓</td>
                </tr>
                <tr className="hover:bg-black/5 transition-colors">
                  <td className="p-6 border-b border-black/10 font-medium">Inventory locations</td>
                  <td className="p-6 border-b border-black/10">Up to 1,000</td>
                  <td className="p-6 border-b border-black/10">Up to 10,000</td>
                  <td className="p-6 border-b border-black/10">Unlimited</td>
                </tr>
                <tr className="hover:bg-black/5 transition-colors">
                  <td className="p-6 border-b border-black/10 font-medium">Staff accounts</td>
                  <td className="p-6 border-b border-black/10">2</td>
                  <td className="p-6 border-b border-black/10">5</td>
                  <td className="p-6 border-b border-black/10">15</td>
                </tr>
                <tr className="hover:bg-black/5 transition-colors">
                  <td className="p-6 border-b border-black/10 font-medium">Transaction fees</td>
                  <td className="p-6 border-b border-black/10">2.0%</td>
                  <td className="p-6 border-b border-black/10 text-zinc-900 font-bold">1.0%</td>
                  <td className="p-6 border-b border-black/10 text-zinc-900 font-bold">0.5%</td>
                </tr>
                <tr className="hover:bg-black/5 transition-colors">
                  <td className="p-6 border-b border-black/10 font-medium">Advanced reporting</td>
                  <td className="p-6 border-b border-black/10 text-black/30">—</td>
                  <td className="p-6 border-b border-black/10">✓</td>
                  <td className="p-6 border-b border-black/10">✓</td>
                </tr>
                <tr className="hover:bg-black/5 transition-colors">
                  <td className="p-6 border-b border-black/10 font-medium">Custom automation</td>
                  <td className="p-6 border-b border-black/10 text-black/30">—</td>
                  <td className="p-6 border-b border-black/10 text-black/30">—</td>
                  <td className="p-6 border-b border-black/10">✓</td>
                </tr>
                <tr className="hover:bg-black/5 transition-colors">
                  <td className="p-6 border-b border-black/10 font-medium">POS Pack Included</td>
                  <td className="p-6 border-b border-black/10 text-black/30">—</td>
                  <td className="p-6 border-b border-black/10 text-zinc-900 font-bold">✓ Free</td>
                  <td className="p-6 border-b border-black/10 text-zinc-900 font-bold">✓ Free</td>
                </tr>
              </tbody>
            </table>
          </div>
        </motion.div>
      </StackingWrapper>

      {/* WRAPPER 4: FAQ & Footer */}
      <div className="relative z-40 w-full md:min-h-[calc(100vh-72px)] bg-zinc-950 rounded-t-[3rem] shadow-[0_-30px_60px_rgba(0,0,0,0.8)] border-t border-white/5 flex flex-col pt-20">
        <motion.div 
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          variants={slideUp}
          className="w-full max-w-[800px] mx-auto px-6 flex-1 mb-32"
        >
          <h2 className="text-3xl md:text-4xl font-bold font-display text-center mb-16">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div 
                key={idx} 
                className="bg-zinc-900/50 border border-white/10 rounded-2xl overflow-hidden transition-all duration-300"
              >
                <button 
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full p-6 text-left flex items-center justify-between font-medium text-lg hover:text-shop-accent transition-colors"
                >
                  {faq.question}
                  <span className={`text-shop-accent transition-transform duration-300 ${openFaq === idx ? 'rotate-45' : ''}`}>
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </span>
                </button>
                <AnimatePresence>
                  {openFaq === idx && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="px-6 pb-6 text-white/60 leading-relaxed"
                    >
                      {faq.answer}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Footer */}
        <footer className="w-full bg-zinc-950 py-12 border-t border-white/10 mt-auto">
          <div className="max-w-[1728px] mx-auto px-6 text-center text-white/40 text-sm">
            <p>© 2026 OwnStore Inc. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </div>
  )
}
