import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent, act } from '@testing-library/react';
import App from '../src/App';

describe('App', () => {
  it('shows line numbers in preview for code blocks', async () => {
    vi.useFakeTimers();
    const { container, getByPlaceholderText } = render(<App />);
    const textarea = getByPlaceholderText('在此粘贴 Markdown 文本...') as HTMLTextAreaElement;

    fireEvent.change(textarea, {
      target: { value: '```javascript\nconsole.log("hi");\n```' },
    });

    act(() => {
      vi.advanceTimersByTime(350);
    });

    await act(async () => {
      await Promise.resolve();
    });

    expect(container.querySelector('.line-number')).toBeTruthy();

    vi.useRealTimers();
  });

  it('toggles line numbers in preview', async () => {
    vi.useFakeTimers();
    const { container, getByPlaceholderText, getByRole } = render(<App />);
    const textarea = getByPlaceholderText('在此粘贴 Markdown 文本...') as HTMLTextAreaElement;

    fireEvent.change(textarea, {
      target: { value: '```javascript\nconsole.log("hi");\n```' },
    });

    act(() => {
      vi.advanceTimersByTime(350);
    });

    await act(async () => {
      await Promise.resolve();
    });

    expect(container.querySelector('.line-number')).toBeTruthy();

    fireEvent.click(getByRole('button', { name: '行号' }));

    await act(async () => {
      await Promise.resolve();
    });

    expect(container.querySelector('.line-number')).toBeNull();

    vi.useRealTimers();
  });
});
