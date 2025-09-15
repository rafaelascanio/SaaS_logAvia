import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import StatCard from './StatCard';

describe('StatCard', () => {
  it('renders the label and value', () => {
    render(<StatCard label="Total Flights" value="123" />);
    
    expect(screen.getByText('Total Flights')).toBeInTheDocument();
    expect(screen.getByText('123')).toBeInTheDocument();
  });
});
