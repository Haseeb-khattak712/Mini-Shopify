import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useMotionValueEvent } from 'framer-motion';

const FRAME_COUNT = 96;

export default function ScrollSequenceBackground({ scrollYProgress }) {
  const canvasRef = useRef(null);
  const [images, setImages] = useState([]);
  const [imagesLoaded, setImagesLoaded] = useState(0);
  const frameRef = useRef(0);
  const rafRef = useRef(null);

  // Preload images
  useEffect(() => {
    const loadedImages = new Array(FRAME_COUNT);
    let loadedCount = 0;
    
    // Prioritize frame 0 so it displays instantly
    const loadFrame = (i) => {
      const img = new Image();
      const frameNum = String(i).padStart(5, '0');
      img.src = `/frames/frame_${frameNum}.jpg`;
      
      img.onload = () => {
        loadedCount++;
        setImagesLoaded(loadedCount);
        // Force a draw if this is the first frame
        if (i === 0 || i === frameRef.current) {
          if (rafRef.current) cancelAnimationFrame(rafRef.current);
          rafRef.current = requestAnimationFrame(() => drawFrame(frameRef.current));
        }
      };
      loadedImages[i] = img;
    };

    // Load frame 0 immediately
    loadFrame(0);

    // Then load the rest
    for (let i = 1; i < FRAME_COUNT; i++) {
      loadFrame(i);
    }
    
    setImages(loadedImages);
  }, []);

  // Function to draw a specific frame
  const drawFrame = useCallback((index) => {
    if (!canvasRef.current || !images[index] || !images[index].complete || images[index].naturalHeight === 0) {
      // If the exact frame isn't loaded yet, try to find the closest loaded frame
      let closest = -1;
      for (let i = index; i >= 0; i--) {
        if (images[i]?.complete && images[i].naturalHeight > 0) {
          closest = i;
          break;
        }
      }
      if (closest === -1) return; // Nothing loaded yet
      index = closest;
    }
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { alpha: false });
    const img = images[index];
    
    const dpr = window.devicePixelRatio || 1;
    
    // CSS dimensions
    const cssWidth = window.innerWidth;
    const cssHeight = window.innerHeight;

    // Cover behavior (like object-fit: cover)
    const scale = Math.max(cssWidth / img.width, cssHeight / img.height);
    const x = (cssWidth / 2) - (img.width / 2) * scale;
    const y = (cssHeight / 2) - (img.height / 2) * scale;

    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw using transformed coordinates for retina
    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
    ctx.restore();
  }, [images]);

  // Handle Resize and Initial Draw
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (canvas) {
        const dpr = window.devicePixelRatio || 1;
        canvas.width = window.innerWidth * dpr;
        canvas.height = window.innerHeight * dpr;
        canvas.style.width = `${window.innerWidth}px`;
        canvas.style.height = `${window.innerHeight}px`;
      }
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => drawFrame(frameRef.current));
    };
    
    handleResize(); // Initial setup
    
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [drawFrame]);

  // Handle scroll updates using rAF
  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    
    const nextFrameIndex = Math.min(
      FRAME_COUNT - 1,
      Math.max(0, Math.floor(latest * FRAME_COUNT))
    );
    
    if (frameRef.current !== nextFrameIndex) {
      frameRef.current = nextFrameIndex;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => drawFrame(frameRef.current));
    }
  });

  return (
    <div className="absolute inset-0 w-full h-full bg-black z-0 pointer-events-none">
      <canvas 
        ref={canvasRef} 
        className="absolute top-0 left-0 w-full h-full object-cover opacity-90 transition-opacity duration-1000"
        style={{ opacity: imagesLoaded > 0 ? 0.9 : 0 }}
      />
      {/* We removed the full screen blocking loader so it displays instantly */}
      {imagesLoaded < FRAME_COUNT && imagesLoaded > 0 && (
        <div className="absolute bottom-4 right-4 text-white/30 text-xs font-mono bg-black/50 px-2 py-1 rounded">
          Buffering {Math.round((imagesLoaded / FRAME_COUNT) * 100)}%
        </div>
      )}
      
      {/* Dark gradient overlay so text remains readable */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/80 pointer-events-none mix-blend-multiply" />
      <div className="absolute inset-0 bg-shop-primary/10 pointer-events-none mix-blend-overlay" />
    </div>
  );
}
