import { describe, it, expect } from 'vitest';
import { AICleaner } from '../src/utils/parser/AICleaner';

describe('AICleaner', () => {
    it('should remove standard citation markers [1]', () => {
        const input = 'This is a fact[1] and another[2].';
        const expected = 'This is a fact and another.';
        expect(AICleaner.cleanAIArtifacts(input)).toBe(expected);
    });

    it('should remove full-width citation markers 【1】', () => {
        const input = 'This is a fact【1】 and another【2】.';
        const expected = 'This is a fact and another.';
        expect(AICleaner.cleanAIArtifacts(input)).toBe(expected);
    });

    it('should remove superscript citation markers ^1^', () => {
        const input = 'This is a fact^1^ and another^2^.';
        const expected = 'This is a fact and another.';
        expect(AICleaner.cleanAIArtifacts(input)).toBe(expected);
    });

    it('should remove "Copy code" artifacts', () => {
        const input = `Here is the code:
Copy code
\`\`\`typescript
const a = 1;
\`\`\``;
        const expected = `Here is the code:

\`\`\`typescript
const a = 1;
\`\`\``;
        // Note: The empty line might remain, which is fine.
        expect(AICleaner.cleanAIArtifacts(input).trim()).toBe(expected.trim());
    });

    it('should handle "复制代码" (Chinese Copy Code)', () => {
        const input = `代码如下：
复制代码
\`\`\`
code
\`\`\``;
        expect(AICleaner.cleanAIArtifacts(input).replace(/\n\n/g, '\n').trim()).toContain('代码如下：\n```');
    });

    it('should leave normal text alone', () => {
        const input = 'Normal text [brackets] and numbers 123.';
        expect(AICleaner.cleanAIArtifacts(input)).toBe(input);
    });
});
