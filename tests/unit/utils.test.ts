import { describe, it, expect } from 'vitest';
import { cn } from '@/lib/utils';

describe('Unit: Utility cn', () => {
  it('merges multiple CSS classes together', () => {
    expect(cn('bg-red-500', 'text-white')).toBe('bg-red-500 text-white');
  });

  it('resolves conflicting tailwind utilities properly', () => {
    // p-4 should overwrite strictly conflicting x/y padding
    expect(cn('px-2 py-1', 'p-4')).toBe('p-4');
  });

  it('safely evaluates conditional classes', () => {
    expect(cn('flex', false && 'hidden', 'items-center')).toBe('flex items-center');
  });

  it('gracefully handles empty inputs safely', () => {
    expect(cn()).toBe('');
  });
});
