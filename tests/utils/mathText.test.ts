import { describe, it, expect } from 'vitest';
import { stripMathDelimiters } from '../../src/utils/math/MathText';

describe('stripMathDelimiters', () => {
  it('should strip block math delimiters', () => {
    const input = 'Before $$a+b=c$$ after';
    const result = stripMathDelimiters(input);

    expect(result).toBe('Before a+b=c after');
  });

  it('should strip inline math delimiters', () => {
    const input = 'Inline $a+b$ text';
    const result = stripMathDelimiters(input);

    expect(result).toBe('Inline a+b text');
  });
});
