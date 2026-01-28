export class MathProcessor {
    /**
     * Process markdown text to clean and normalize LaTeX math formulas
     */
    static process(markdown: string): string {
        if (!markdown) return '';

        let processed = markdown;

        // 0. Convert LaTeX standard delimiters to dollar signs
        // This handles \[...\] and \(...\) from AI outputs like DeepSeek
        processed = this.convertLatexDelimiters(processed);

        // 1. Fix inline math spaces ($ L $ -> $L$)
        processed = this.fixInlineMathSpaces(processed);

        // 2. Fix single dollar blocks (standalone $ line -> $$)
        processed = this.fixSingleDollarBlocks(processed);

        return processed;
    }

    /**
     * Convert LaTeX standard math delimiters to dollar sign format
     * \[...\] -> $$...$$  (display/block math)
     * \(...\) -> $...$    (inline math)
     * 
     * Many AI models (DeepSeek, etc.) output formulas using LaTeX standard notation,
     * but marked-katex-extension only supports dollar sign notation.
     */
    private static convertLatexDelimiters(text: string): string {
        let result = text;

        // Convert \[...\] to $$...$$ (block math)
        // Use [\s\S]*? to match content including newlines (non-greedy)
        result = result.replace(/\\\[([\s\S]*?)\\\]/g, (_, content: string) => {
            return `$$${content}$$`;
        });

        // Convert \(...\) to $...$ (inline math)
        result = result.replace(/\\\(([\s\S]*?)\\\)/g, (_, content: string) => {
            return `$${content}$`;
        });

        return result;
    }

    /**
     * Fixes spaces in inline math: $ L $ -> $L$
     * Pandoc/Word often requires no spaces inside the dollar signs for inline math.
     */
    private static fixInlineMathSpaces(text: string): string {
        // Regex matches: $ + spaces + content + spaces + $
        // Lookbehind/Lookahead ensures we don't match $$ (block math)
        // Note: JavaScript RegExp lookbehind support is good in modern environments (node 18+, chrome 62+)
        return text.replace(/(?<!\$)\$(?!\$)[ \t]+([^\n$]+?)[ \t]+(?<!\$)\$(?!\$)/g, (match: string, content: string) => {
            return `$${content.trim()}$`;
        });
    }

    /**
     * Converts single dollar lines into double dollar blocks.
     * PasteMD Logic: If a line contains ONLY $ (with optional whitespace), treats it as a block delimiter.
     */
    private static fixSingleDollarBlocks(text: string): string {
        const lines = text.split('\n');
        const newLines: string[] = [];

        let inCodeBlock = false;
        let codeFenceChar = '';
        let inDollarBlock = false;

        for (const line of lines) {
            const stripped = line.trim();

            // 1. Code block detection
            if (stripped.startsWith('```') || stripped.startsWith('~~~')) {
                const fence = stripped.substring(0, 3);
                if (!inCodeBlock) {
                    inCodeBlock = true;
                    codeFenceChar = fence;
                    newLines.push(line);
                    continue;
                } else if (stripped.startsWith(codeFenceChar)) {
                    inCodeBlock = false;
                    codeFenceChar = '';
                    newLines.push(line);
                    continue;
                }
            }

            if (inCodeBlock) {
                newLines.push(line);
                continue;
            }

            // 2. Single dollar detection
            // Matches lines that are just "$" or "   $   "
            if (/^\s*\$\s*$/.test(line)) {
                const prefix = line.substring(0, line.indexOf('$'));
                // Always replace with $$
                newLines.push(`${prefix}$$`);
                // Toggle state just for logic tracking if needed, 
                // though strictly replacing $ with $$ is stateless in terms of "converting delimiter"
                // provided the user intended $ as a delimiter. 
                // However, standard markdown using $ for block is non-standard.
                // PasteMD does this to support rough notes.
                inDollarBlock = !inDollarBlock;
            } else {
                newLines.push(line);
            }
        }

        return newLines.join('\n');
    }
}
