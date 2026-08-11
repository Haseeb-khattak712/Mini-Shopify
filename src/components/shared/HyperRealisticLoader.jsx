import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function HyperRealisticLoader({ isLoaded, progress = 0, onComplete }) {
  const [displayProgress, setDisplayProgress] = useState(0);
  const [loadingComplete, setLoadingComplete] = useState(false);

  useEffect(() => {
    let current = displayProgress;
    // ensure we don't get stuck at 0. Start simulating up to a max of 95% until actually loaded.
    let target = isLoaded ? 100 : Math.max(progress, 95); 
    
    // Smoothly animate to target
    const interval = setInterval(() => {
      if (current < target && !isLoaded) {
        // Slow simulation before actual load
        current += Math.random() * 1.5; 
        if (current > 95) current = 95; 
        setDisplayProgress(Math.floor(current));
      } else if (isLoaded && current < 100) {
        // Fast completion when loaded
        current += 5;
        if (current > 100) current = 100;
        setDisplayProgress(Math.floor(current));
      }

      if (current >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          setLoadingComplete(true);
          setTimeout(() => {
            if (onComplete) onComplete();
          }, 900); // Wait for exit animation to complete before calling onComplete
        }, 400); // Hold at 100 for a split second for satisfying UX
      }
    }, 40);

    return () => clearInterval(interval);
  }, [progress, isLoaded]);

  return (
    <AnimatePresence>
      {!loadingComplete && (
        <motion.div
          key="loader"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.05, filter: "blur(15px)" }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-[9999] bg-[#000302] flex flex-col items-center justify-center text-white overflow-hidden"
        >
          {/* Subtle cinematic gradient background */}
          <div className="absolute inset-0 bg-gradient-to-tr from-shop-accent/5 via-transparent to-transparent opacity-60" />
          
          {/* Noise texture for premium realism */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHdpZHRoPSc2MCcgaGVpZ2h0PSc2MCc+CjxyZWN0IHdpZHRoPSc2MCcgaGVpZ2h0PSc2MCcgZmlsbD0nbm9uZScvPgo8Y2lyY2xlIGN4PSczMCcgY3k9JzMwJyByPScxJyBmaWxsPSdibGFjaycgZmlsbC1vcGFjaXR5PScwLjI1Jy8+Cjwvc3ZnPg==')] opacity-20 mix-blend-overlay"></div>

          <div className="relative z-10 flex flex-col items-center w-full max-w-2xl px-8 md:px-12">
            
            <motion.div 
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="flex flex-col md:flex-row md:items-end justify-between w-full mb-4 md:mb-2 gap-4"
            >
              <div className="flex flex-col justify-end pb-4">
                 <span className="text-xs md:text-sm font-semibold tracking-[0.3em] uppercase text-white/50 mb-1">OwnStore Engine</span>
                 <motion.span 
                   key={
                     displayProgress < 40 ? 'init' : 
                     displayProgress < 85 ? 'assets' : 
                     displayProgress < 100 ? 'render' : 'ready'
                   }
                   initial={{ opacity: 0, y: 5 }}
                   animate={{ opacity: 1, y: 0 }}
                   className="text-[10px] md:text-xs font-mono tracking-widest text-shop-accent uppercase"
                 >
                   {displayProgress < 40 ? 'Establishing connection...' : 
                    displayProgress < 85 ? 'Loading high-res assets...' : 
                    displayProgress < 100 ? 'Rendering experience...' : 
                    'Ready to launch'}
                 </motion.span>
              </div>

              <div className="text-[100px] md:text-[140px] lg:text-[180px] font-light font-display leading-[0.8] tracking-tighter tabular-nums flex items-end">
                {displayProgress}
                <span className="text-3xl md:text-5xl lg:text-7xl text-shop-accent ml-2 mb-2 md:mb-4">%</span>
              </div>
            </motion.div>

            {/* Hyper-realistic Progress Bar */}
            <div className="w-full h-[2px] bg-white/10 relative overflow-hidden rounded-full backdrop-blur-sm">
              <motion.div 
                className="absolute top-0 left-0 h-full bg-shop-accent shadow-[0_0_20px_rgba(149,191,71,0.8)]"
                initial={{ width: "0%" }}
                animate={{ width: `${displayProgress}%` }}
                transition={{ duration: 0.1, ease: "linear" }}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent w-full h-full -translate-x-full animate-[shimmer_2s_infinite]" />
            </div>
            
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
