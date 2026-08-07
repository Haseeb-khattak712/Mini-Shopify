import { useState, Suspense, useEffect, useRef, lazy } from 'react'
import { motion, useScroll, useTransform, AnimatePresence, useMotionValueEvent, useSpring } from 'framer-motion'
import { Button, Input } from '@/components/ui/ui'
import { HeroScene } from '@/components/shared/HeroScene'
import { useTilt } from '@/hooks/useTilt'

const GlobeScene = lazy(() => import('@/components/shared/GlobeScene').then(module => ({ default: module.GlobeScene })));
import { useNavigate, Link } from 'react-router-dom'
import { isAuthenticated, register, getUserContext, isAdmin } from '@/services/storage'

// Helper for changing words
function AnimatedHeadline() {
  const words = ["Build your Store", "Grow your Brand", "Sell Everywhere", "Launch Faster", "Scale Smarter"]
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => setIndex(prev => (prev + 1) % words.length), 3000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="h-[140px] md:h-[180px] lg:h-[220px] relative">
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ y: 30, opacity: 0, filter: 'blur(8px)' }}
          animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
          exit={{ y: -30, opacity: 0, filter: 'blur(8px)' }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="absolute inset-0 flex items-start"
        >
          <span className="bg-clip-text text-transparent bg-gradient-to-br from-white to-white/70">
            {words[index]}
          </span>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

function StatsCounter({ target, suffix = '' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="text-center"
    >
      <div className="text-5xl md:text-7xl font-bold text-white mb-2 font-display">{target}{suffix}</div>
    </motion.div>
  )
}

// ── Landing Page ──────────────────────────────────────────────────────────────
export function LandingPage() {
  const navigate = useNavigate()
  const heroRef = useRef(null)
  const { scrollYProgress: pageScrollProgress } = useScroll()
  const { scrollYProgress: rawHeroScrollProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end end"]
  })
  
  const heroScrollProgress = useSpring(rawHeroScrollProgress, {
    stiffness: 400,
    damping: 40,
    restDelta: 0.001
  });

  const scale = useTransform(pageScrollProgress, [0, 1], [1, 1.2])

  const [navVisible, setNavVisible] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  
  useMotionValueEvent(heroScrollProgress, "change", (latest) => {
    setNavVisible(latest >= 0.95)
  })

  // Fade and translate text up at the very end of the hero sequence (0.85 to 1.0)
  const heroTextY = useTransform(heroScrollProgress, [0.85, 1], ["0%", "-100%"])
  const heroTextOpacity = useTransform(heroScrollProgress, [0.85, 1], [1, 0])

  return (
    <div className="bg-shop-lightbg font-body selection:bg-shop-accent selection:text-shop-primary">
      {/* Nav */}
      <nav className={`fixed top-0 left-0 right-0 z-[100] py-4 transition-all duration-700 ${navVisible ? 'bg-[#000000]/80 backdrop-blur-xl border-b border-white/5' : 'bg-transparent border-transparent backdrop-blur-none'}`}>
        <div className="mx-auto max-w-[1728px] px-6 md:px-10 lg:px-16 xl:px-20 2xl:px-24 w-full flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate('/')} style={{ perspective: '1000px' }}>
            <img src="/logo.png" alt="OwnStore Logo" className="w-10 h-10 object-contain drop-shadow-md opacity-80 mix-blend-luminosity group-hover:mix-blend-normal group-hover:opacity-100 transition-all duration-500" style={{ transition: 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)', transformStyle: 'preserve-3d' }} onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.15) rotateY(15deg) rotateX(10deg) translateZ(10px)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1) rotateY(0deg) rotateX(0deg) translateZ(0px)'} />
            <span className="font-black text-shop-accent font-logo text-2xl tracking-tighter transition-colors duration-300">OwnStore</span>
          </div>
          <div className="hidden md:flex items-center gap-8 font-medium text-white/80 text-sm">
            <a href="#platform" className="hover:text-white transition-colors">Platform</a>
            <a href="#customization" className="hover:text-white transition-colors">Customization</a>
            <a href="#checkout" className="hover:text-white transition-colors">Checkout</a>
            <Link to="/pricing" className="hover:text-white transition-colors">Pricing</Link>
            <Link to="/marketplace" className="hover:text-white text-shop-accent font-semibold transition-colors">Marketplace</Link>
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
                <a href="#platform" onClick={() => setMobileMenuOpen(false)} className="hover:text-white transition-colors">Platform</a>
                <a href="#customization" onClick={() => setMobileMenuOpen(false)} className="hover:text-white transition-colors">Customization</a>
                <a href="#checkout" onClick={() => setMobileMenuOpen(false)} className="hover:text-white transition-colors">Checkout</a>
                <Link to="/pricing" onClick={() => setMobileMenuOpen(false)} className="hover:text-white transition-colors">Pricing</Link>
                <Link to="/marketplace" onClick={() => setMobileMenuOpen(false)} className="text-shop-accent transition-colors">Marketplace</Link>
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

      {/* SECTION 1: HERO (Scroll Sequence Stage) */}
      <section ref={heroRef} className="relative h-[550vh] bg-zinc-900/50">
        {/* Sticky wrapper */}
        <div className="sticky top-0 h-screen overflow-hidden flex items-center">

          <div className="absolute inset-0 w-full h-full bg-black z-0 pointer-events-none">
            <video 
              autoPlay 
              loop 
              muted 
              playsInline
              className="absolute top-0 left-0 w-full h-full object-cover opacity-60"
              src="https://cdn.pixabay.com/video/2021/08/04/83866-584742540_large.mp4"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/80 pointer-events-none mix-blend-multiply" />
            <div className="absolute inset-0 bg-shop-primary/10 pointer-events-none mix-blend-overlay" />
          </div>

          <div className="relative z-10 mx-auto max-w-[1728px] w-full px-6 md:px-10 lg:px-16 xl:px-20 2xl:px-24 grid lg:grid-cols-12 gap-12 items-center">
            <motion.div
              className="lg:col-span-7 pt-10"
              style={{ y: heroTextY, opacity: heroTextOpacity }}
            >
              <h1 className="text-[64px] md:text-[80px] lg:text-[96px] xl:text-[110px] font-medium text-white font-display leading-[1.05] tracking-tighter mb-6">
                <AnimatedHeadline />
              </h1>
              <p className="text-xl md:text-2xl lg:text-3xl text-white/70 leading-relaxed mb-12 max-w-2xl font-normal tracking-wide">
                The premier platform for ambitious brands to create, manage, and scale their online business globally.
              </p>
              <div className="flex flex-wrap gap-5">
                <motion.div whileTap={{ scale: 0.95 }}>
                  <Button size="lg" onClick={() => navigate('/signup')} className="bg-white !text-zinc-950 hover:bg-white/10 hover:!text-white hover:scale-[1.02] transition-all text-lg lg:text-xl px-10 h-14 lg:h-16 rounded-full border-none font-semibold shadow-[0_0_40px_rgba(255,255,255,0.15)]">
                    Start free trial
                  </Button>
                </motion.div>
                <motion.div whileTap={{ scale: 0.95 }}>
                  <Button variant="outline" size="lg" onClick={() => navigate('/store/demo')} className="hover:scale-[1.02] transition-all bg-gradient-to-br from-white/[0.08] to-transparent border border-white/10 shadow-[0_30px_60px_rgba(0,0,0,0.6)] backdrop-blur-md hover:bg-black/40 backdrop-blur-md border border-white/20 text-white text-lg lg:text-xl px-10 h-14 lg:h-16 rounded-full font-medium">
                    Watch demo
                  </Button>
                </motion.div>
              </div>
            </motion.div>

            <div className="hidden lg:block lg:col-span-5 relative h-[600px] w-full perspective-[1000px]">
              {/* Empty space to allow the globe scroll animation to shine through on the right side */}
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2 & 3 COMBINED: SELL EVERYWHERE & EXPAND REACH */}
      <section id="platform" className="relative bg-[#000806] rounded-t-[80px] -mt-20 z-20 shadow-[0_-20px_60px_rgba(0,0,0,0.8)] border-t border-white/15 clip-path-auto overflow-clip">
        <div className="mx-auto max-w-[1728px] px-6 md:px-10 lg:px-16 xl:px-20 2xl:px-24">

          {/* PART 1: Sell Everywhere (Sticky Text Left, Scrolling Images Right) */}
          <div className="flex flex-col lg:flex-row items-start gap-16 pb-[20vh]">

            {/* Pinned Left Side */}
            <div className="w-full lg:w-1/2 lg:sticky lg:top-[25vh] pt-32 lg:pt-0 lg:h-[75vh] flex flex-col justify-start">
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.7 }}
                className="max-w-2xl"
              >
                <h2 className="text-5xl md:text-[72px] lg:text-[80px] font-light font-display text-white leading-[1] tracking-tighter mb-8 cursor-default">
                  Sell everywhere <br /> people <br /> shop.
                </h2>
                <p className="text-xl md:text-2xl text-white/80 leading-relaxed mb-8 font-medium">
                  Online and in person. Across AI and on social. Locally and globally.
                </p>
                <Button variant="ghost" className="text-shop-accent hover:bg-shop-accent/10 px-6 py-2 font-semibold group inline-flex items-center gap-2 text-xl rounded-full">
                  Explore channels <span className="group-hover:translate-x-1 transition-transform">→</span>
                </Button>
              </motion.div>
            </div>

            {/* Scrolling Right Side */}
            <div className="w-full lg:w-1/2 flex flex-col items-center gap-[15vh] lg:pt-[40vh] pb-[10vh]">
              <motion.div
                initial={{ opacity: 0, y: 100 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.8 }}
                className="w-full max-w-[480px] aspect-[4/5] rounded-[40px] border border-white/10 shadow-2xl overflow-hidden bg-gradient-to-br from-white/[0.08] to-transparent border border-white/10 shadow-[0_30px_60px_rgba(0,0,0,0.6)] backdrop-blur-md cursor-pointer group"
              >
                <img src="https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?auto=format&fit=crop&w=800&q=80" alt="Sales Dashboard" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-40 mix-blend-luminosity group-hover:mix-blend-normal group-hover:opacity-100 filter group-hover:brightness-110 contrast-125" />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 100 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.8 }}
                className="w-full max-w-[360px] aspect-[3/4] rounded-[40px] border border-white/10 shadow-2xl overflow-hidden bg-gradient-to-br from-white/[0.08] to-transparent border border-white/10 shadow-[0_30px_60px_rgba(0,0,0,0.6)] backdrop-blur-md lg:-translate-x-12 cursor-pointer group"
              >
                <img src="https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=800&q=80" alt="Mobile Storefront" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-40 mix-blend-luminosity group-hover:mix-blend-normal group-hover:opacity-100 filter group-hover:brightness-110 contrast-125" />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 100 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.8 }}
                className="w-full max-w-[400px] aspect-square rounded-[40px] border border-white/10 shadow-2xl overflow-hidden bg-gradient-to-br from-shop-accent/10 to-transparent border border-shop-accent/20 shadow-[0_30px_60px_rgba(149,191,71,0.15)] backdrop-blur-md lg:translate-x-8 cursor-pointer group"
              >
                <img src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=800&q=80" alt="Point of Sale" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-40 mix-blend-luminosity group-hover:mix-blend-normal group-hover:opacity-100 filter group-hover:brightness-110 contrast-125" />
              </motion.div>
            </div>

          </div>

          {/* PART 2: Expand Reach (Scrolling Visuals Left, Sticky Text Right) */}
          <div className="flex flex-col-reverse lg:flex-row items-start gap-16 pt-[10vh] pb-32">

            {/* Scrolling Left Side (Visuals) */}
            <div className="w-full lg:w-1/2 flex flex-col items-center gap-[10vh] py-[10vh]">

              <motion.div
                initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.6 }}
                className="w-full max-w-[500px] lg:-translate-x-6"
              >
                <motion.div 
                  animate={{ y: [0, -15, 0] }} transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
                  className="w-full aspect-[4/3] rounded-[40px] shadow-[0_30px_60px_rgba(0,0,0,0.4)] overflow-hidden group cursor-pointer border border-white/10 bg-gradient-to-br from-white/[0.08] to-transparent border border-white/10 shadow-[0_30px_60px_rgba(0,0,0,0.6)] backdrop-blur-md"
                >
                  <img src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=800" alt="Marketplaces" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-40 mix-blend-luminosity group-hover:mix-blend-normal group-hover:opacity-100 filter group-hover:brightness-110 contrast-125" />
                </motion.div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.6, delay: 0.2 }}
                className="w-full max-w-[500px] lg:translate-x-6"
              >
                <motion.div 
                  animate={{ y: [0, -20, 0] }} transition={{ repeat: Infinity, duration: 7, ease: "easeInOut", delay: 1 }}
                  className="w-full aspect-[4/3] rounded-[40px] shadow-[0_30px_60px_rgba(0,0,0,0.4)] overflow-hidden group cursor-pointer border border-white/10 bg-gradient-to-br from-white/[0.08] to-transparent border border-white/10 shadow-[0_30px_60px_rgba(0,0,0,0.6)] backdrop-blur-md"
                >
                  <img src="https://images.unsplash.com/photo-1556742031-c6961e8560b0?auto=format&fit=crop&q=80&w=800" alt="Mobile Checkout" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-40 mix-blend-luminosity group-hover:mix-blend-normal group-hover:opacity-100 filter group-hover:brightness-110 contrast-125" />
                </motion.div>
              </motion.div>

            </div>

            {/* Pinned Right Side */}
            <div className="w-full lg:w-1/2 lg:sticky lg:top-[30vh] pt-32 lg:pt-0 lg:h-[70vh] flex flex-col justify-start lg:pl-16">
              <motion.div
                initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}
                className="max-w-xl"
              >
                <h2 className="text-5xl md:text-[72px] lg:text-[80px] font-light font-display text-white leading-[1] tracking-tighter mb-8 cursor-default">
                  Expand <br /> your <br /> reach.
                </h2>
                <p className="text-xl md:text-2xl text-white/80 leading-relaxed mb-8 font-medium">
                  Meet your customers wherever they spend their time with seamless, native integrations.
                </p>
              </motion.div>
            </div>

          </div>

        </div>
      </section>

      {/* SECTION 4: CUSTOMIZE EVERYTHING (Sticky Text Left, Scrolling Feature Cards Right) */}
      <section id="customization" className="bg-[#010c0a] rounded-t-[80px] -mt-20 relative z-30 border-t border-white/15 shadow-[0_-20px_60px_rgba(0,0,0,0.8)] overflow-clip pb-32">
        <div className="mx-auto max-w-[1728px] px-6 md:px-10 lg:px-16 xl:px-20 2xl:px-24">
          <div className="flex flex-col items-center pt-32 pb-16 text-center">
             <motion.div
                initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}
                className="max-w-4xl"
             >
               <h2 className="text-5xl md:text-[72px] lg:text-[80px] font-light font-display text-white leading-[1] tracking-tighter mb-8 cursor-default">
                    Customize everything.
               </h2>
               <p className="text-xl md:text-2xl text-white/80 leading-relaxed mb-10 font-medium mx-auto max-w-3xl">
                    Use our drag-and-drop theme editor or dive into the code. The power is entirely in your hands to build the exact brand experience you envision.
               </p>
               <Button variant="default" size="lg" className="bg-gradient-to-br from-shop-accent/10 to-transparent border border-shop-accent/20 shadow-[0_30px_60px_rgba(149,191,71,0.15)] backdrop-blur-md hover:bg-shop-secondary text-white hover:text-zinc-900 rounded-full px-8 h-14 text-lg font-semibold shadow-lg shadow-shop-primary/20 hover:scale-105 transition-transform">
                    Explore developer tools
               </Button>
             </motion.div>
          </div>

          <div className="flex flex-col lg:flex-row gap-2 md:gap-3 max-w-[1400px] mx-auto items-stretch mt-12 pb-32 px-4 h-auto lg:h-[500px] xl:h-[600px]">
             <motion.div 
               initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.7 }}
               className="flex-[4] h-[400px] lg:h-full"
             >
               <div className="w-full h-full rounded-xl overflow-hidden shadow-[0_30px_60px_rgba(0,0,0,0.5)] border border-white/10 relative group cursor-pointer bg-gradient-to-br from-white/[0.08] to-transparent border border-white/10 shadow-[0_30px_60px_rgba(0,0,0,0.6)] backdrop-blur-md">
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-transparent transition-colors duration-700 z-10 mix-blend-overlay"/>
                  <img src="https://images.unsplash.com/photo-1600607686527-6fb886090705?auto=format&fit=crop&w=800&q=80" alt="Visual UI Design Editor" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-40 mix-blend-luminosity group-hover:mix-blend-normal group-hover:opacity-100 filter group-hover:brightness-110 contrast-125" />
               </div>
             </motion.div>

             <motion.div 
               initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.7, delay: 0.2 }}
               className="flex-[3] h-[500px] lg:h-full"
             >
               <div className="w-full h-full rounded-xl overflow-hidden shadow-[0_30px_60px_rgba(0,0,0,0.5)] border border-white/10 relative group cursor-pointer bg-gradient-to-br from-white/[0.08] to-transparent border border-white/10 shadow-[0_30px_60px_rgba(0,0,0,0.6)] backdrop-blur-md">
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-transparent transition-colors duration-700 z-10 mix-blend-overlay"/>
                  <img src="https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&w=800&q=80" alt="Headless API Coding" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-40 mix-blend-luminosity group-hover:mix-blend-normal group-hover:opacity-100 filter group-hover:brightness-110 contrast-125" />
               </div>
             </motion.div>

             <motion.div 
               initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.7, delay: 0.4 }}
               className="flex-[4] h-[400px] lg:h-full"
             >
               <div className="w-full h-full rounded-xl overflow-hidden shadow-[0_30px_60px_rgba(0,0,0,0.5)] border border-white/10 relative group cursor-pointer bg-gradient-to-br from-white/[0.08] to-transparent border border-white/10 shadow-[0_30px_60px_rgba(0,0,0,0.6)] backdrop-blur-md">
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-transparent transition-colors duration-700 z-10 mix-blend-overlay"/>
                  <img src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80" alt="App Integrations Analytics" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-40 mix-blend-luminosity group-hover:mix-blend-normal group-hover:opacity-100 filter group-hover:brightness-110 contrast-125" />
               </div>
             </motion.div>
          </div>
        </div>
      </section>

      {/* SECTION 5: CHECKOUT / GLOBE */}
      <section id="checkout" className="bg-[#000806] text-white py-32 rounded-t-[80px] -mt-20 relative z-[40] overflow-hidden min-h-screen flex items-center border-t border-white/15 shadow-[0_-20px_60px_rgba(0,0,0,0.8)]">
        
        <div className="mx-auto max-w-[1728px] w-full px-6 md:px-10 lg:px-16 xl:px-20 2xl:px-24 relative z-10">

          <div className="text-center max-w-4xl mx-auto mb-32">
            <h2 className="text-5xl md:text-[64px] font-light font-display leading-[1.05] tracking-tight mb-6 drop-shadow-2xl cursor-default">
              There is no greater place <br /> for you to build <br /> and shop.
            </h2>
            <p className="text-xl text-shop-accent/90 drop-shadow-lg font-medium">
              Trusted by the biggest brands to handle massive volume with perfect reliability.
            </p>
          </div>

          {/* Row 1: Checkout */}
          <div className="grid lg:grid-cols-2 gap-16 items-center mb-64">
            <div>
              <h3 className="text-4xl md:text-5xl font-light font-display leading-tight mb-6 drop-shadow-xl">
                The world's best <br /> converting <br /> checkout.
              </h3>
              <p className="text-lg text-white/90 leading-relaxed drop-shadow-md font-medium">
                Maximize your revenue with a checkout experience engineered for speed, trust, and frictionless conversion.
              </p>
            </div>

            {/* Mock Checkout UI Premium */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-zinc-900/90 to-zinc-950/90 relative overflow-hidden backdrop-blur-xl text-white rounded-[32px] p-8 shadow-[0_30px_80px_rgba(0,0,0,0.8)] border border-white/5 pointer-events-auto group ring-1 ring-white/10"
            >
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-[1px] bg-gradient-to-r from-transparent via-shop-accent/80 to-transparent"></div>
              
              <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-5">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-shop-accent/20 border border-shop-accent/50 flex items-center justify-center font-bold text-shop-accent text-sm shadow-[0_0_15px_rgba(149,191,71,0.3)]">O</div>
                  <div className="font-semibold text-xl tracking-tight">OwnStore Pay</div>
                </div>
                <div className="text-xs font-semibold px-4 py-1.5 rounded-full bg-gradient-to-br from-white/[0.08] to-transparent border border-white/10 shadow-[0_30px_60px_rgba(0,0,0,0.6)] backdrop-blur-md text-white/90 border border-white/10 shadow-inner">Express</div>
              </div>
              
              
              {/* Premium Product Summary */}
              <div className="flex items-center gap-4 mb-6 p-4 rounded-2xl bg-white/5 border border-white/10 shadow-inner group-hover:border-white/20 transition-colors">
                <div className="w-16 h-16 rounded-xl overflow-hidden bg-black/40 border border-white/10 shrink-0">
                  <img src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=150&q=80" alt="Premium Watch" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-white/90 text-sm">Chronograph Watch</div>
                  <div className="text-white/50 text-xs mt-1">Matte Black • One Size</div>
                </div>
                <div className="text-right">
                  <div className="font-medium text-white text-sm">$115.00</div>
                  <div className="text-white/40 text-[10px] mt-1 tracking-wider uppercase">Qty 1</div>
                </div>
              </div>

              <div className="space-y-4 mb-8">
                {/* Contact */}
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 text-sm">✉</div>
                  <div className="h-14 w-full bg-black/40 rounded-xl border border-white/5 flex items-center pl-10 pr-4 text-sm text-white/60 focus-within:ring-1 focus-within:ring-shop-accent transition-all cursor-text">customer@example.com</div>
                </div>
                {/* Card Number */}
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 text-sm">💳</div>
                  <div className="h-14 w-full bg-black/40 rounded-xl border border-white/5 flex items-center pl-10 pr-4 text-sm text-white/70 justify-between focus-within:ring-1 focus-within:ring-shop-accent transition-all cursor-text">
                     <span className="tracking-widest font-mono text-xs">•••• •••• •••• 4242</span>
                     <div className="flex gap-1.5"><div className="w-6 h-4 bg-white/20 rounded-sm"></div><div className="w-6 h-4 bg-white/20 rounded-sm"></div></div>
                  </div>
                </div>
                {/* Expiry & CVC */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="h-14 w-full bg-black/40 rounded-xl border border-white/5 flex items-center px-5 text-sm text-white/50 focus-within:ring-1 focus-within:ring-shop-accent transition-all cursor-text tracking-widest font-mono">12 / 28</div>
                  <div className="h-14 w-full bg-black/40 rounded-xl border border-white/5 flex items-center px-5 text-sm text-white/50 focus-within:ring-1 focus-within:ring-shop-accent transition-all cursor-text tracking-widest font-mono">CVC</div>
                </div>
              </div>

              {/* Order Summary */}
              <div className="mb-8 space-y-3 text-sm">
                <div className="flex justify-between text-white/60"><span>Subtotal</span><span>$115.00</span></div>
                <div className="flex justify-between text-white/60"><span>Taxes</span><span>$9.00</span></div>
                <div className="flex justify-between font-medium text-white text-base pt-4 border-t border-white/10 mt-2"><span>Total</span><span>$124.00</span></div>
              </div>

              <Button className="w-full bg-gradient-to-r from-shop-primary to-[#49681b] hover:from-[#49681b] hover:to-shop-primary transition-all duration-500 h-14 text-lg font-medium tracking-wide rounded-xl shadow-[0_0_20px_rgba(149,191,71,0.2)] border border-shop-accent/30 text-white relative overflow-hidden group/btn">
                <span className="relative z-10 flex items-center justify-center gap-2">
                  <svg className="w-5 h-5 text-shop-accent/80" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                  Pay $124.00
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/btn:animate-[shimmer_1.5s_infinite]"></div>
              </Button>
              <div className="mt-4 flex justify-center items-center gap-4 text-[10px] text-white/40 uppercase tracking-widest font-mono">
                <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-shop-accent"></span> Encrypted</span>
                <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-shop-accent"></span> Verified</span>
              </div>
            </motion.div>
          </div>

          {/* Row 2: Grow Together */}
          <div className="grid lg:grid-cols-2 gap-16 items-center relative z-0">
            {/* 3D Globe - Placed back in the left column so the earth is centered left, but stars bleed outwards */}
            <div className="relative h-[600px] w-full pointer-events-auto">
              <Suspense fallback={null}>
                <GlobeScene />
              </Suspense>
            </div>

            <div className="relative z-10 pointer-events-none">
              <h3 className="text-4xl md:text-5xl font-light font-display leading-tight mb-6 drop-shadow-xl">
                Own. <br /> Build. <br /> Grow Together.
              </h3>
              <p className="text-lg text-white/90 leading-relaxed drop-shadow-md font-medium">
                Your OwnStore runs strong, even during your most epic product drops.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* SECTION 7: TESTIMONIALS & STATS */}
      <section className="bg-[#000302] py-32 relative z-[60] -mt-20 rounded-t-[80px] border-t border-white/15 shadow-[0_-20px_60px_rgba(0,0,0,0.8)] overflow-hidden">
        <div className="mx-auto max-w-[1728px] px-6 md:px-10 lg:px-16 xl:px-20 2xl:px-24 mb-16 mt-10 text-center">
          <h2 className="text-4xl md:text-5xl font-light font-display text-white cursor-default">
            Empowering independent <br /> business owners <br /> everywhere.
          </h2>
        </div>

        {/* Animated Marquee */}
        <div className="flex gap-8 overflow-hidden relative w-full h-[300px] items-center">
          <motion.div
            animate={{ x: [0, -1000] }}
            transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
            className="flex gap-8 whitespace-nowrap px-8 absolute left-0"
          >
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="w-[400px] h-[220px] bg-zinc-900/50/40 border border-white/5 p-8 flex flex-col shrink-0 hover:-translate-y-2 hover:bg-zinc-900/50/60 hover:border-white/30 transition-all cursor-grab rounded-3xl shadow-xl">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center font-bold text-white/50">{i}</div>
                  <div>
                    <div className="font-bold text-white">Store Owner {i}</div>
                    <div className="text-sm text-zinc-100">Verified Merchant</div>
                  </div>
                </div>
                <p className="text-white/80 whitespace-normal leading-relaxed">
                  "OwnStore transformed how we sell online. It's incredibly intuitive and scales effortlessly with our massive traffic spikes."
                </p>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Global Stats */}
        <div className="max-w-[1200px] mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-12 mt-32 mb-10">
          <div>
            <StatsCounter target="10" suffix="M+" />
            <p className="text-center font-medium text-white/60 uppercase tracking-widest text-sm">Merchants</p>
          </div>
          <div>
            <StatsCounter target="175" suffix="+" />
            <p className="text-center font-medium text-white/60 uppercase tracking-widest text-sm">Countries</p>
          </div>
          <div>
            <StatsCounter target="800" suffix="B+" />
            <p className="text-center font-medium text-white/60 uppercase tracking-widest text-sm">Global Sales</p>
          </div>
          <div>
            <StatsCounter target="99.9" suffix="%" />
            <p className="text-center font-medium text-white/60 uppercase tracking-widest text-sm">Uptime</p>
          </div>
        </div>
      </section>

      {/* SECTION 8: CTA */}
      <section className="bg-[#000000] pb-32 pt-16 relative z-[70] -mt-20 rounded-t-[80px] border-t border-white/15 shadow-[0_-20px_60px_rgba(0,0,0,0.8)] overflow-hidden">
        <div className="max-w-[1200px] mx-auto px-6 mt-20">
          <div className="bg-gradient-to-br from-[#01120e] to-[#000806] rounded-[60px] p-12 md:p-20 text-center border border-white/5 relative overflow-hidden shadow-[0_20px_80px_rgba(4,47,38,0.3)] ring-1 ring-white/10">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHdpZHRoPSc2MCcgaGVpZ2h0PSc2MCc+CjxyZWN0IHdpZHRoPSc2MCcgaGVpZ2h0PSc2MCcgZmlsbD0nbm9uZScvPgo8Y2lyY2xlIGN4PSczMCcgY3k9JzMwJyByPScxJyBmaWxsPSdibGFjaycgZmlsbC1vcGFjaXR5PScwLjA1Jy8+Cjwvc3ZnPg==')] opacity-10 mix-blend-overlay"></div>

            <div className="relative z-10">
              <h2 className="text-5xl md:text-7xl font-light font-display text-white mb-8 tracking-tight cursor-default">
                Start <br /> your <br /> journey.
              </h2>
              <p className="text-xl text-white/70 mb-12 max-w-2xl mx-auto font-medium">
                Try OwnStore for free, and explore all the tools and services you need to start, run, and grow your business.
              </p>
              <Button size="lg" onClick={() => navigate('/signup')} className="!bg-gradient-to-br from-shop-accent/10 to-transparent border border-shop-accent/20 shadow-[0_30px_60px_rgba(149,191,71,0.15)] backdrop-blur-md hover:!bg-gradient-to-br from-shop-accent/10 to-transparent border border-shop-accent/20 shadow-[0_30px_60px_rgba(149,191,71,0.15)] backdrop-blur-md/90 hover:scale-[1.03] transition-all shadow-xl shadow-black/20 text-xl px-12 h-16 rounded-full text-white">
                Start free trial
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#000000] px-6 py-12 relative z-[80] -mt-20 rounded-t-[80px] border-t border-white/15 shadow-[0_-20px_60px_rgba(0,0,0,0.8)] overflow-hidden">
        <div className="mx-auto max-w-[1728px] px-6 md:px-10 lg:px-16 xl:px-20 2xl:px-24 flex flex-col md:flex-row items-center justify-between text-sm text-white/60 font-medium mt-10">
          <div className="flex items-center gap-3 mb-4 md:mb-0 cursor-pointer group" onClick={() => window.location.href = '/'} style={{ perspective: '1000px' }}>
            <img src="/logo.png" alt="OwnStore Logo" className="w-8 h-8 object-contain drop-shadow-md opacity-80 mix-blend-luminosity group-hover:mix-blend-normal group-hover:opacity-100 transition-all duration-500" style={{ transition: 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)', transformStyle: 'preserve-3d' }} onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.15) rotateY(15deg) rotateX(10deg) translateZ(10px)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1) rotateY(0deg) rotateX(0deg) translateZ(0px)'} />
            <span className="font-black text-shop-accent font-logo text-xl tracking-tighter transition-colors duration-300">OwnStore</span>
            <span className="ml-4 text-sm text-white/60">© 2026 OwnStore Inc.</span>
          </div>
          <div className="flex gap-8">
            <a href="#" className="hover:text-shop-primary transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-shop-primary transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-shop-primary transition-colors">Sitemap</a>
          </div>
        </div>
      </footer>
    </div>
  )
}

// ── Signup Flow ───────────────────────────────────────────────────────────────

export function SignupFlow() {
  const navigate = useNavigate()
  const [role, setRole] = useState('customer')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [bizName, setBizName] = useState('')
  const [subdomain, setSubdomain] = useState('')
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const slugify = (val) => val.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')

  const handleSignup = async () => {
    const err = {}
    if (!name) err.name = 'Required'
    if (!email || !email.includes('@')) err.email = 'Valid email required'
    if (!password || password.length < 6) err.password = 'Min 6 characters'

    if (role === 'admin') {
      if (!bizName) err.bizName = 'Required'
      if (!subdomain) err.subdomain = 'Required'
    }

    if (Object.keys(err).length > 0) return setErrors(err)
    setErrors({})

    setLoading(true)
    const res = await register(name, email, password, role, bizName, subdomain)
    setLoading(false)
    if (res.success) {
      if (role === 'admin') {
        navigate('/admin')
      } else {
        navigate('/account')
      }
    } else {
      setErrors({ form: res.error })
    }
  }

  return (
    <div className="min-h-screen bg-transparent flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Subtle 3D background */}
      <div className="absolute inset-0 pointer-events-none opacity-30">
        <Suspense fallback={null}><HeroScene /></Suspense>
      </div>
      <div className="absolute inset-0 bg-transparent/70 pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center w-full">
        {/* Logo */}
        <div className="flex items-center gap-2 mb-10 cursor-pointer group" onClick={() => window.location.href = '/'} style={{ perspective: '1000px' }}>
          <img src="/logo.png" alt="OwnStore Logo" className="w-8 h-8 object-contain drop-shadow-md opacity-80 mix-blend-luminosity group-hover:mix-blend-normal group-hover:opacity-100 transition-all duration-500" style={{ transition: 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)', transformStyle: 'preserve-3d' }} onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.15) rotateY(15deg) rotateX(10deg) translateZ(10px)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1) rotateY(0deg) rotateX(0deg) translateZ(0px)'} />
          <span className="font-black text-shop-accent font-logo text-xl tracking-tighter transition-colors duration-300">OwnStore</span>
        </div>

        {/* Card */}
        <div
          className="bg-zinc-900/50/90 backdrop-blur border border-white/10 rounded-[12px] shadow-sm w-full max-w-md p-8"
          style={{ animation: 'cardIn 0.3s cubic-bezier(0.34,1.56,0.64,1)' }}
        >
          <h1 className="text-2xl font-bold font-display text-white mb-1">Create an account</h1>
          <p className="text-sm text-white/60 mb-6">Join OwnStore to create your store or manage orders.</p>

          <div className="flex p-1 bg-gradient-to-br from-white/[0.08] to-transparent border border-white/10 shadow-[0_30px_60px_rgba(0,0,0,0.6)] backdrop-blur-md rounded-lg mb-6">
            <button
              className={`flex-1 text-sm font-medium py-1.5 rounded-md transition-colors ${role === 'customer' ? 'bg-zinc-100 text-zinc-900 shadow-sm' : 'text-white/60 hover:text-white/80'}`}
              onClick={() => { setRole('customer'); setErrors({}); }}
            >
              Customer
            </button>
            <button
              className={`flex-1 text-sm font-medium py-1.5 rounded-md transition-colors ${role === 'admin' ? 'bg-zinc-100 text-zinc-900 shadow-sm' : 'text-white/60 hover:text-white/80'}`}
              onClick={() => { setRole('admin'); setErrors({}); }}
            >
              Seller
            </button>
          </div>

          <div className="flex flex-col gap-4">
            <Input label="Name" placeholder="Your name" value={name}
              onChange={e => setName(e.target.value)} error={errors.name} />
            <Input label="Email address" type="email" placeholder="you@example.com" value={email}
              onChange={e => setEmail(e.target.value)} error={errors.email} />
            <Input label="Password" type="password" placeholder="Create a password" value={password}
              onChange={e => setPassword(e.target.value)} error={errors.password} />

            {role === 'admin' && (
              <div className="mt-2 space-y-4 pt-4 border-t border-white/5">
                <Input label="Business Name" placeholder="Acme Goods Co." value={bizName}
                  onChange={e => { setBizName(e.target.value); setSubdomain(slugify(e.target.value)) }} error={errors.bizName} />

                <div>
                  <label className="text-sm font-medium text-white/80 block mb-1.5">Subdomain</label>
                  <div className="flex rounded-[10px] border border-white/10 overflow-hidden focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20">
                    <input className="flex-1 px-3.5 py-2.5 text-sm outline-none bg-zinc-900/50 text-white" placeholder="yourstore"
                      value={subdomain} onChange={e => { setSubdomain(slugify(e.target.value)) }} />
                    <span className="px-3 flex items-center text-sm text-white/50 bg-transparent border-l border-white/10 font-mono">.ownstore.com</span>
                  </div>
                  {errors.subdomain && <p className="text-xs text-red-500 mt-1">⚠ {errors.subdomain}</p>}
                </div>
              </div>
            )}

            {errors.form && <p className="text-xs text-red-500">⚠ {errors.form}</p>}
            <Button className="w-full mt-2" onClick={handleSignup} disabled={loading}>{loading ? 'Creating account...' : 'Create account →'}</Button>
          </div>
        </div>

        <p className="text-xs text-white/50 mt-6 relative z-10">
          Already have an account?{' '}
          <button onClick={() => navigate('/login')} className="text-shop-accent hover:underline">Sign in</button>
        </p>
      </div>

      <style>{`
        @keyframes cardIn { from { opacity:0; transform:translateY(20px) scale(0.96) } to { opacity:1; transform:translateY(0) scale(1) } }
        @keyframes bounceIn { from { opacity:0; transform:scale(0.5) } to { opacity:1; transform:scale(1) } }
      `}</style>
    </div>
  )
}
