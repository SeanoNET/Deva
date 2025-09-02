import { render, screen } from '@testing-library/react'
import Home from '../app/page'

// Mock Convex
jest.mock('convex/react', () => ({
  useMutation: jest.fn(() => jest.fn()),
  useQuery: jest.fn(() => null),
}))

describe('Home Page', () => {
  it('renders welcome message', () => {
    render(<Home />)
    
    expect(screen.getByText('Welcome to Deva')).toBeInTheDocument()
    expect(screen.getByText('Your intelligent development assistant for Linear')).toBeInTheDocument()
  })

  it('shows connect linear button when not authenticated', () => {
    render(<Home />)
    
    expect(screen.getByRole('button', { name: 'Connect Linear Account' })).toBeInTheDocument()
  })

  it('shows connection instructions', () => {
    render(<Home />)
    
    expect(screen.getByText(/Connect your Linear account to get started/)).toBeInTheDocument()
    expect(screen.getByText(/You'll be redirected to Linear to authorize Deva/)).toBeInTheDocument()
  })
})