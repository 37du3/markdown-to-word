// 转换工具性能缓存
/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ConversionResult } from '../../types';
export class ConversionCache {
  private cache = new Map<string, CacheEntry>();
  private maxSize = 10;
  private ttl = 5 * 60 * 1000; // 5 minutes

  /**
   * 获取缓存的转换结果
   */
  get(markdown: string): CacheEntry | null {
    const key = this.generateKey(markdown);
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    // 检查是否过期
    if (Date.now() - entry.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry;
  }

  /**
   * 缓存转换结果
   */
  set(markdown: string, result: Omit<CacheEntry, 'timestamp'>): void {
    const key = this.generateKey(markdown);

    // 清理旧缓存
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }

    this.cache.set(key, {
      ...result,
      timestamp: Date.now(),
    });
  }

  /**
   * 清除缓存
   */
  clear(): void {
    this.cache.clear();
  }

  private generateKey(markdown: string): string {
    // 使用简单的哈希函数
    let hash = 0;
    for (let i = 0; i < markdown.length; i++) {
      const char = markdown.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // 转换为32位整数
    }
    return hash.toString();
  }
}

interface CacheEntry {
  html: string;
  docx?: Blob;
  stats: any;
  timestamp: number;
}
