import { describe, it, expect } from 'vitest';
import { MathProcessor } from '../../src/utils/parser/MathProcessor';

describe('MathProcessor', () => {
    it('should process empty string', () => {
        expect(MathProcessor.process('')).toBe('');
    });

    describe('fixInlineMathSpaces', () => {
        it('should remove spaces in inline math', () => {
            const input = 'Let $ L $ be a line.';
            const expected = 'Let $L$ be a line.';
            expect(MathProcessor.process(input)).toBe(expected);
        });

        it('should remove spaces in inline math with tabs', () => {
            const input = 'Value is $ \t x \t $.';
            const expected = 'Value is $x$.';
            expect(MathProcessor.process(input)).toBe(expected);
        });

        it('should NOT affect block math ($$)', () => {
            const input = '$$ a + b $$';
            // MathProcessor logic for double dollars is that it leaves them alone unless it matches the single dollar block logic?
            // actually fixInlineMathSpaces regex uses lookarounds to avoid $$.
            // But fixSingleDollarBlocks shouldn't touch $$ blocks.
            expect(MathProcessor.process(input)).toBe(input);
        });

        it('should handle multiple inline formulas', () => {
            const input = '$ a $ and $ b $';
            const expected = '$a$ and $b$';
            expect(MathProcessor.process(input)).toBe(expected);
        });
    });

    describe('fixSingleDollarBlocks', () => {
        it('should convert single dollar line to double dollar', () => {
            const input = 'Line 1\n$\nE = mc^2\n$\nLine 2';
            const expected = 'Line 1\n$$\nE = mc^2\n$$\nLine 2';
            expect(MathProcessor.process(input)).toBe(expected);
        });

        it('should convert single dollar line with spaces to double dollar', () => {
            const input = '   $   \nContent\n   $   ';
            const expected = '   $$\nContent\n   $$';
            expect(MathProcessor.process(input)).toBe(expected);
        });

        it('should NOT convert dollars inside code blocks', () => {
            const input = '```\n$\n```';
            expect(MathProcessor.process(input)).toBe(input);
        });

        it('should NOT convert dollars inside fenced code (~~~)', () => {
            const input = '~~~\n$\n~~~';
            expect(MathProcessor.process(input)).toBe(input);
        });
    });

    it('should handle both fixes together', () => {
        const input = 'Inline $ a $ and block:\n$\nb\n$';
        const expected = 'Inline $a$ and block:\n$$\nb\n$$';
        expect(MathProcessor.process(input)).toBe(expected);
    });
});
