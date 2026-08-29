import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
  gsap.registerPlugin(ScrollTrigger);
}

let lenisInstance = null;

/**
 * Initializes Lenis smooth scrolling and synchronizes it with GSAP's ticker and ScrollTrigger.
 * Returns the Lenis instance and a cleanup function.
 */
export function initSmoothScroll() {
  if (typeof window === 'undefined') return null;

  // Destroy previous instance if one exists
  if (lenisInstance) {
    lenisInstance.destroy();
    lenisInstance = null;
  }

  // Create Lenis smooth scrolling instance
  lenisInstance = new Lenis({
    duration: 1.15,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Apple-like smooth exponential decay
    orientation: 'vertical',
    gestureOrientation: 'vertical',
    smoothWheel: true,
    wheelMultiplier: 1.05,
    touchMultiplier: 1.5,
    infinite: false,
    autoRaf: false
  });

  // Connect Lenis scroll events to GSAP ScrollTrigger
  lenisInstance.on('scroll', ScrollTrigger.update);

  // Bind GSAP ticker to Lenis requestAnimationFrame
  const updateTicker = (time) => {
    if (lenisInstance) {
      lenisInstance.raf(time * 1000);
    }
  };

  gsap.ticker.add(updateTicker);
  gsap.ticker.lagSmoothing(0);

  return {
    lenis: lenisInstance,
    destroy: () => {
      gsap.ticker.remove(updateTicker);
      if (lenisInstance) {
        lenisInstance.destroy();
        lenisInstance = null;
      }
    }
  };
}

export function getLenis() {
  return lenisInstance;
}

export function scrollToTop(options = { duration: 0.8 }) {
  if (lenisInstance) {
    lenisInstance.scrollTo(0, options);
  } else {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
