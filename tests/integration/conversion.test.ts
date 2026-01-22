import { describe, it, expect } from 'vitest';
import { MarkdownParser } from '../../src/utils/parser/MarkdownParser';
import { HtmlConverter } from '../../src/utils/converter/HtmlConverter';
import type { ConversionOptions } from '../../src/types';

describe('Integration: Full Conversion Flow', () => {
  const parser = new MarkdownParser();
  const converter = new HtmlConverter();

  const options: ConversionOptions = {
    table: {
      enableMergedCells: true,
      defaultAlign: 'left',
      headerBackground: '#f0f0f0',
      borderColor: '#000000',
    },
    code: {
      showLineNumbers: true,
      theme: 'light',
      fontFamily: 'JetBrains Mono',
      fontSize: 10,
    },
    text: {
      fontFamily: 'Noto Serif SC',
      fontSize: 12,
      lineHeight: 1.5,
      linkColor: '#0563c1',
    },
    heading: {
      fontFamily: 'Noto Serif SC',
      h1Size: 16,
      h2Size: 14,
      h3Size: 13,
      h4Size: 12,
      h5Size: 11,
      h6Size: 10,
    },
    math: {
      output: 'katex',
    },
  };

  it('should convert complex markdown document', () => {
    const markdown = `# Project Report

## Executive Summary

This document outlines the **key findings** from our analysis.

### Methodology

We used the following approach:

1. Data Collection
2. Analysis
3. Reporting

### Results

The data shows significant improvement:

| Metric | Before | After | Change |
|--------|--------|-------|--------|
| Speed | 100 | 150 | +50% |
| Quality | 85 | 92 | +7% |
| ↑ | ↑ | ↑ | ↑ |

\`\`\`typescript
const results = analyze(data);
console.log('Improvement:', results.improvement);
\`\`\`

Inline math $a+b=c$ and block:

$$
c = \\pm\\sqrt{a^2 + b^2}
$$

For more info, visit [our website](https://example.com).`;

    const ast = parser.parse(markdown);
    const html = converter.convert(ast, options);

    expect(html).toContain('<h1');
    expect(html).toContain('<h2');
    expect(html).toContain('<strong>');
    expect(html).toContain('<table');
    expect(html).toContain('rowspan');
    expect(html).toContain('class="hljs');
    expect(html).toContain('katex');
    expect(html).toContain('<a href="https://example.com"');
  });
});
