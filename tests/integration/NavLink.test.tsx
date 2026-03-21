import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { NavLink } from '@/components/NavLink';

describe('Integration: NavLink Component', () => {
  it('renders correctly and respects routing paths', () => {
    render(
      <BrowserRouter>
        <NavLink to="/dashboard" className="base-class" activeClassName="active">
          Dashboard
        </NavLink>
      </BrowserRouter>
    );

    const linkElement = screen.getByRole('link', { name: /dashboard/i });
    expect(linkElement).toBeInTheDocument();
    expect(linkElement).toHaveAttribute('href', '/dashboard');
    expect(linkElement).toHaveClass('base-class');
  });
});
