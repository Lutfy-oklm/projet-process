import { useEffect } from 'react';

export const useScrollToTop = (dependency?: any) => {
  useEffect(() => {
    // Faire défiler vers le haut de manière fluide
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth'
    });
  }, [dependency]);
};

// Hook pour un scroll immédiat (sans animation)
export const useScrollToTopImmediate = (dependency?: any) => {
  useEffect(() => {
    // Faire défiler vers le haut immédiatement
    window.scrollTo(0, 0);
  }, [dependency]);
};