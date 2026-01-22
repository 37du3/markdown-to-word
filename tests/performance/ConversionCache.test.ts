import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ConversionCache } from '../../src/utils/performance/ConversionCache';

describe('ConversionCache', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns cached entry before expiration', () => {
    const cache = new ConversionCache();
    cache.set('hello', { html: '<p>Hello</p>', stats: { words: 1 } });

    const entry = cache.get('hello');
    expect(entry?.html).toBe('<p>Hello</p>');
  });

  it('expires cached entry after ttl', () => {
    const cache = new ConversionCache();
    cache.set('hello', { html: '<p>Hello</p>', stats: { words: 1 } });

    vi.advanceTimersByTime(5 * 60 * 1000 + 1);

    const entry = cache.get('hello');
    expect(entry).toBeNull();
  });

  it('evicts oldest entry when max size exceeded', () => {
    const cache = new ConversionCache();
    for (let i = 0; i < 11; i += 1) {
      cache.set(`k${i}`, { html: `<p>${i}</p>` });
    }

    const oldest = cache.get('k0');
    expect(oldest).toBeNull();
  });
});
