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
    const loadedImages = [];
    let loadedCount = 0;
    
    for (let i = 0; i < FRAME_COUNT; i++) {
      const img = new Image();
      const frameNum = String(i).padStart(5, '0');
      img.src = `/frames/frame_${frameNum}.jpg`;
      
      img.onload = () => {
        loadedCount++;
        setImagesLoaded(loadedCount);
      };
      loadedImages.push(img);
    }
    setImages(loadedImages);
  }, []);

  // Function to draw a specific frame
  const drawFrame = useCallback((index) => {
    if (!canvasRef.current || !images[index] || imagesLoaded < FRAME_COUNT) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { alpha: false }); // Optimize by disabling alpha channel if not needed
    const img = images[index];

    // Cover behavior (like object-fit: cover)
    const scale = Math.max(canvas.width / img.width, canvas.height / img.height);
    const x = (canvas.width / 2) - (img.width / 2) * scale;
    const y = (canvas.height / 2) - (img.height / 2) * scale;

    // Use fillRect instead of clearRect for performance, or just drawImage if it covers everything
    ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
  }, [images, imagesLoaded]);

  // Handle Resize and Initial Draw
  useEffect(() => {
    if (imagesLoaded === FRAME_COUNT) {
      const canvas = canvasRef.current;
      if (canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }
      drawFrame(frameRef.current);
      
      const handleResize = () => {
        if (canvas) {
          canvas.width = window.innerWidth;
          canvas.height = window.innerHeight;
        }
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        rafRef.current = requestAnimationFrame(() => drawFrame(frameRef.current));
      };
      
      window.addEventListener('resize', handleResize);
      return () => {
        window.removeEventListener('resize', handleResize);
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
      };
    }
  }, [imagesLoaded, drawFrame]);

  // Handle scroll updates using rAF
  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    if (imagesLoaded < FRAME_COUNT) return;
    
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
        className="w-full h-full object-cover opacity-60"
      />
      {/* Loading state indicator */}
      {imagesLoaded < FRAME_COUNT && (
        <div className="absolute inset-0 flex items-center justify-center text-white/50 text-sm font-mono bg-black">
          Loading assets: {Math.round((imagesLoaded / FRAME_COUNT) * 100)}%
        </div>
      )}
      
      {/* Dark gradient overlay so text remains readable */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/80 pointer-events-none mix-blend-multiply" />
      <div className="absolute inset-0 bg-shop-primary/10 pointer-events-none mix-blend-overlay" />
    </div>
  );
}
