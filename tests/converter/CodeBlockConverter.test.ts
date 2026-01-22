/* eslint-disable */
import { describe, it, expect } from 'vitest';
import { CodeBlockConverter } from '../../src/utils/converter/CodeBlockConverter';
import type { ConversionOptions } from '../../src/types';

describe('CodeBlockConverter', () => {
  const converter = new CodeBlockConverter();
  const options: ConversionOptions = {
    code: {
      theme: 'light',
      showLineNumbers: false,
      fontFamily: 'JetBrains Mono',
      fontSize: 10,
    },
  } as ConversionOptions;

  it('should highlight TypeScript code', () => {
    const token = {
      type: 'code',
      lang: 'typescript',
      text: 'const x: number = 1;',
    };

    const result = converter.convert(token as any, options);
    expect(result).toContain('<pre');
    expect(result).toContain('hljs');
    expect(result).toContain('typescript');
  });
});
