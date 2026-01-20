import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDebounce, useDebouncedCallback, useClipboard, useLocalStorage } from '../../src/hooks/useDebounce';

describe('useDebounce', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('应该返回原始值', () => {
    const { result } = renderHook(() => useDebounce('test', 300));
    expect(result.current).toBe('test');
  });

  it('应该在延迟后更新值', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 300),
      { initialProps: { value: 'initial' } }
    );

    expect(result.current).toBe('initial');

    rerender({ value: 'updated' });
    expect(result.current).toBe('initial');

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(result.current).toBe('updated');
  });

  it('应该在延迟期间多次更新只返回最终值', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 300),
      { initialProps: { value: 'a' } }
    );

    expect(result.current).toBe('a');

    rerender({ value: 'b' });
    rerender({ value: 'c' });
    rerender({ value: 'd' });

    expect(result.current).toBe('a');

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(result.current).toBe('d');
  });
});

describe('useDebouncedCallback', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('应该延迟调用函数', () => {
    const fn = vi.fn();
    const { result } = renderHook(() => useDebouncedCallback(fn, 300));

    act(() => {
      result.current('arg1', 'arg2');
    });

    expect(fn).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(fn).toHaveBeenCalledWith('arg1', 'arg2');
  });

  it('应该支持取消', () => {
    const fn = vi.fn();
    const { result } = renderHook(() => useDebouncedCallback(fn, 300));

    act(() => {
      result.current('test');
    });

    act(() => {
      result.current.cancel();
    });

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(fn).not.toHaveBeenCalled();
  });

  it('应该在延迟期间多次调用只执行一次', () => {
    const fn = vi.fn();
    const { result } = renderHook(() => useDebouncedCallback(fn, 300));

    act(() => {
      result.current('first');
      result.current('second');
      result.current('third');
    });

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith('third');
  });
});

describe('useClipboard', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('应该返回初始状态', () => {
    const { result } = renderHook(() => useClipboard());
    expect(result.current.copied).toBe(false);
    expect(result.current.error).toBe(null);
  });

  it('应该成功复制文本', async () => {
    const writeText = vi.spyOn(navigator.clipboard, 'writeText').mockResolvedValue(undefined);

    const { result } = renderHook(() => useClipboard());

    await act(async () => {
      const success = await result.current.copy('test text');
      expect(success).toBe(true);
    });

    expect(writeText).toHaveBeenCalledWith('test text');
    expect(result.current.copied).toBe(true);
  });

  it('应该在复制失败时设置错误', async () => {
    const error = new Error('Clipboard error');
    vi.spyOn(navigator.clipboard, 'writeText').mockRejectedValue(error);

    const { result } = renderHook(() => useClipboard());

    await act(async () => {
      const success = await result.current.copy('test');
      expect(success).toBe(false);
    });

    expect(result.current.error).toBe(error);
  });
});

describe('useLocalStorage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('应该返回初始值', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 'default'));
    expect(result.current[0]).toBe('default');
  });

  it('应该从 localStorage 读取值', () => {
    localStorage.setItem('test-key', '"stored value"');

    const { result } = renderHook(() => useLocalStorage('test-key', 'default'));
    expect(result.current[0]).toBe('stored value');
  });

  it('应该保存值到 localStorage', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 'default'));

    act(() => {
      result.current[1]('new value');
    });

    expect(result.current[0]).toBe('new value');
    expect(localStorage.getItem('test-key')).toBe('"new value"');
  });

  it('应该支持函数式更新', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 0));

    act(() => {
      result.current[1]((prev) => prev + 1);
    });

    expect(result.current[0]).toBe(1);
  });
});
