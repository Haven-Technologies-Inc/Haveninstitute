import { lazy, ComponentType } from 'react'
import { Suspense } from 'react'
import { Loader2 } from 'lucide-react'

// Loading component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-[400px]">
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
    <span className="ml-2 text-muted-foreground">Loading...</span>
  </div>
)

// Higher-order component for lazy loading with error boundary
export function lazyLoad<T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  fallback: React.ComponentType = LoadingSpinner
) {
  const LazyComponent = lazy(importFunc)
  
  return function LazyWrapper(props: React.ComponentProps<T>) {
    return (
      <Suspense fallback={<fallback />}>
        <LazyComponent {...props} />
      </Suspense>
    )
  }
}

// Preload function for critical components
export function preloadComponent(importFunc: () => Promise<{ default: any }>) {
  return importFunc()
}

// Lazy loaded heavy components
export const LazyDashboard = lazyLoad(() => import('../components/Dashboard'))
export const LazyCATTest = lazyLoad(() => import('../components/CATTest'))
export const LazyNCLEXSimulator = lazyLoad(() => import('../components/NCLEXSimulator'))
export const LazyBookReader = lazyLoad(() => import('../components/BookReader'))
export const LazyFlashcardsEnhanced = lazyLoad(() => import('../components/FlashcardsEnhanced'))
export const LazyStudyPlannerComplete = lazyLoad(() => import('../components/StudyPlannerComplete'))
export const LazyAnalytics = lazyLoad(() => import('../components/Analytics'))
export const LazyAIChat = lazyLoad(() => import('../components/AIChat'))
export const LazyBookstore = lazyLoad(() => import('../components/Bookstore'))

// Admin components
export const LazyAdminOverview = lazyLoad(() => import('../components/admin/AdminOverview'))
export const LazyAdminUsers = lazyLoad(() => import('../components/admin/AdminUsers'))
export const LazyAdminAnalytics = lazyLoad(() => import('../components/admin/AdminAnalytics'))

// Preload critical components on app load
export function preloadCriticalComponents() {
  // Preload dashboard as it's most commonly accessed
  preloadComponent(() => import('../components/Dashboard'))
  
  // Preload authentication components
  preloadComponent(() => import('../components/auth/LoginForm'))
}

// Intersection Observer for lazy loading components in viewport
export function useIntersectionObserver(
  ref: React.RefObject<Element>,
  callback: () => void,
  options: IntersectionObserverInit = {}
) {
  React.useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        callback()
        observer.disconnect()
      }
    }, options)

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [ref, callback, options])
}
