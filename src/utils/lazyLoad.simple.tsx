/**
 * Simple Lazy Loading Utility
 * Basic lazy loading without complex component dependencies
 */

import { lazy, ComponentType, ReactNode } from 'react'
import { Suspense } from 'react'
import React from 'react'

// Simple loading component
const LoadingSpinner: React.FC = () => (
  <div className="flex items-center justify-center min-h-[400px]">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    <span className="ml-2 text-muted-foreground">Loading...</span>
  </div>
)

// Simple lazy loading wrapper
export function simpleLazyLoad<T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>
) {
  const LazyComponent = lazy(importFunc)
  
  return function LazyWrapper(props: React.ComponentProps<T>) {
    return (
      <Suspense fallback={<LoadingSpinner />}>
        <LazyComponent {...props} />
      </Suspense>
    )
  }
}

// Export basic lazy loading function
export { lazy };

// Export loading component for fallback
export { LoadingSpinner };

// Preload function
export function preloadComponent(importFunc: () => Promise<any>) {
  return importFunc()
}
