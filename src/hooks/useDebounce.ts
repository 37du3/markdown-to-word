/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-return */
import { useState, useEffect, useRef, useCallback } from 'react';
import type { DebouncedFunction } from '../types';

/**
 * 防抖 Hook
 * @param value - 需要防抖的值
 * @param delay - 延迟时间（毫秒）
 * @returns 防抖后的值
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * 创建防抖函数
 * @param fn - 需要防抖的函数
 * @param delay - 延迟时间（毫秒）
 * @returns 防抖后的函数
 */
export function useDebouncedCallback<F extends (...args: unknown[]) => unknown>(
  fn: F,
  delay: number
): DebouncedFunction<F> {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastArgsRef = useRef<Parameters<F> | null>(null);

  const cancel = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    lastArgsRef.current = null;
  }, []);

  const debouncedFn = useCallback(
    (...args: Parameters<F>) => {
      lastArgsRef.current = args;

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        if (lastArgsRef.current !== null) {
          fn(...lastArgsRef.current);
        }
        timeoutRef.current = null;
        lastArgsRef.current = null;
      }, delay);
    },
    [fn, delay]
  ) as DebouncedFunction<F>;

  debouncedFn.cancel = cancel;

  return debouncedFn;
}

/**
 * 节流 Hook
 * @param value - 需要节流的值
 * @param limit - 时间限制（毫秒）
 * @returns 节流后的值
 */
export function useThrottledCallback<T extends (...args: unknown[]) => void>(
  callback: T,
  limit: number
): T {
  const lastRanRef = useRef<number>(0);

  return useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now();

      if (now - lastRanRef.current >= limit) {
        callback(...args);
        lastRanRef.current = now;
      }
    },
    [callback, limit]
  ) as T;
}

/**
 * 本地存储 Hook
 * @param key - 存储键名
 * @param initialValue - 初始值
 * @returns [存储的值, 设置值的函数]
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      try {
        const valueToStore =
          value instanceof Function ? value(storedValue) : value;
        setStoredValue(valueToStore);
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      } catch (error) {
        console.error('Error saving to localStorage:', error);
      }
    },
    [key, storedValue]
  );

  return [storedValue, setValue];
}

/**
 * 复制到剪贴板 Hook
 * @returns 复制函数和状态
 */
export function useClipboard() {
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const copy = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setError(null);
      setTimeout(() => setCopied(false), 2000);
      return true;
    } catch (err) {
      setCopied(false);
      setError(err instanceof Error ? err : new Error('Copy failed'));
      return false;
    }
  }, []);

  return { copy, copied, error };
}

/**
 * 窗口大小 Hook
 * @returns 窗口尺寸
 */
export function useWindowSize() {
  const [size, setSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const handleResize = () => {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return size;
}

/**
 * 键盘快捷键 Hook
 * @param key - 键名
 * @param callback - 回调函数
 * @param modifiers - 修饰键
 */
export function useKeyboardShortcut(
  key: string,
  callback: () => void,
  modifiers: { ctrl?: boolean; shift?: boolean; alt?: boolean; meta?: boolean } = {}
) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const { ctrl = false, shift = false, alt = false, meta = false } = modifiers;

      if (
        event.key.toLowerCase() === key.toLowerCase() &&
        event.ctrlKey === ctrl &&
        event.shiftKey === shift &&
        event.altKey === alt &&
        event.metaKey === meta
      ) {
        event.preventDefault();
        callback();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [key, callback, modifiers]);
}
