import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import React from 'react';
import { ErrorBoundary } from '../../src/App';

describe('ErrorBoundary', () => {
  it('renders fallback on error', () => {
    const Broken = () => {
      throw new Error('boom');
    };

    const spy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const { getByText } = render(
      <ErrorBoundary>
        <Broken />
      </ErrorBoundary>
    );

    expect(getByText('应用出现错误')).toBeTruthy();
    expect(getByText('boom')).toBeTruthy();
    spy.mockRestore();
  });
});
