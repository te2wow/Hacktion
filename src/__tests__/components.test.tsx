import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Logo from '@/components/Logo';
import LoadingSpinner from '@/components/LoadingSpinner';

describe('Logo Component', () => {
  it('renders logo with correct text', () => {
    render(<Logo />);
    expect(screen.getByText('Hack')).toBeDefined();
    expect(screen.getByText('tion')).toBeDefined();
  });

  it('renders with different sizes', () => {
    const { rerender } = render(<Logo size="sm" />);
    expect(screen.getByText('H')).toBeDefined();
    
    rerender(<Logo size="lg" />);
    expect(screen.getByText('H')).toBeDefined();
  });
});

describe('LoadingSpinner Component', () => {
  it('renders loading spinner with text', () => {
    render(<LoadingSpinner />);
    expect(screen.getByText('Loading team data...')).toBeDefined();
  });
});