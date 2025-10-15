// Performance monitoring utilities

export function measureBundleSize() {
  if (typeof window !== 'undefined' && 'performance' in window) {
    // Measure First Load JS
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    
    return {
      domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
      loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
      firstPaint: performance.getEntriesByName('first-paint')[0]?.startTime || 0,
      firstContentfulPaint: performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0,
    };
  }
  return null;
}

export function logPerformanceMetrics() {
  if (process.env.NODE_ENV === 'development') {
    const metrics = measureBundleSize();
    if (metrics) {
      console.group('🚀 Performance Metrics');
      console.log('DOM Content Loaded:', `${metrics.domContentLoaded.toFixed(2)}ms`);
      console.log('Load Complete:', `${metrics.loadComplete.toFixed(2)}ms`);
      console.log('First Paint:', `${metrics.firstPaint.toFixed(2)}ms`);
      console.log('First Contentful Paint:', `${metrics.firstContentfulPaint.toFixed(2)}ms`);
      console.groupEnd();
    }
  }
}

// Web Vitals tracking
export function trackWebVitals() {
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    // Simple performance tracking for development
    console.log('Performance tracking enabled');
    
    // Track page load time
    window.addEventListener('load', () => {
      const loadTime = performance.now();
      console.log(`Page loaded in ${loadTime.toFixed(2)}ms`);
    });
  }
}