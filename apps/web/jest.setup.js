import '@testing-library/jest-dom'

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
    }
  },
  useSearchParams() {
    return new URLSearchParams()
  },
  usePathname() {
    return '/'
  },
}))

// Mock environment variables
process.env.NEXT_PUBLIC_CONVEX_URL = 'https://test-convex.cloud'
process.env.LINEAR_CLIENT_ID = 'test-client-id'
process.env.LINEAR_CLIENT_SECRET = 'test-client-secret'
process.env.NEXT_PUBLIC_LINEAR_REDIRECT_URI = 'http://localhost:3000/api/auth/linear/callback'