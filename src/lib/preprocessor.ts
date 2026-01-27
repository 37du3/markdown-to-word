/**
 * AI Content Preprocessor
 * Cleans common artifacts from AI-generated content (ChatGPT, Claude, etc.)
 */

export interface PreprocessorConfig {
    removeCopyCode?: boolean;
    removeCitations?: boolean;
    removeButtons?: boolean;
    trimWhitespace?: boolean;
    sanitizeLatex?: boolean;
}

const DEFAULT_CONFIG: PreprocessorConfig = {
    removeCopyCode: true,
    removeCitations: true,
    removeButtons: true,
    trimWhitespace: true,
    sanitizeLatex: true,
};

/**
 * Remove "Copy code" text that appears in code blocks from ChatGPT/Claude
 */
function removeCopyCodeArtifacts(content: string): string {
    // Remove standalone "Copy code" lines
    let cleaned = content.replace(/^Copy code\s*$/gim, '');

    // Remove "Copy code" at the end of code blocks
    cleaned = cleaned.replace(/```[\s\S]*?Copy code\s*```/g, (match) => {
        return match.replace(/Copy code\s*/, '');
    });

    return cleaned;
}

/**
 * Remove citation markers like [1], [2], 【^1^】, 【^11^】 etc.
 * Supports both Western-style [1] and Kimi-style 【^1^】 citations
 * IMPORTANT: Preserves content inside LaTeX math delimiters ($...$, $$...$$)
 */
function removeCitations(content: string): string {
    // First, protect math content by replacing with placeholders
    const mathBlocks: string[] = [];
    let protected_ = content;

    // Protect block math first ($$...$$)
    protected_ = protected_.replace(/\$\$([\s\S]*?)\$\$/g, (match) => {
        mathBlocks.push(match);
        return `___MATH_BLOCK_${mathBlocks.length - 1}___`;
    });

    // Protect inline math ($...$)
    protected_ = protected_.replace(/\$([^$\n]+)\$/g, (match) => {
        mathBlocks.push(match);
        return `___MATH_BLOCK_${mathBlocks.length - 1}___`;
    });

    // Now safely remove citations from non-math content
    // Remove Western-style citations: [1], [2], etc. (standalone, not part of markdown links)
    // Only match [N] that are NOT preceded by ] (to avoid markdown link syntax)
    let cleaned = protected_.replace(/(?<!\])\[(\d+)\]/g, '');

    // Remove Kimi-style citations: 【^1^】, 【^11^】, etc.
    cleaned = cleaned.replace(/【\^\d+\^】/g, '');

    // Clean up any remaining empty Chinese brackets
    cleaned = cleaned.replace(/【】/g, '');

    // Restore math blocks
    mathBlocks.forEach((block, i) => {
        cleaned = cleaned.replace(`___MATH_BLOCK_${i}___`, block);
    });

    return cleaned;
}

/**
 * Remove common button text artifacts
 */
function removeButtonArtifacts(content: string): string {
    const buttonPatterns = [
        /^(Continue|Regenerate|Stop generating)\s*$/gim,
        /^(Copy|Share|Edit)\s*$/gim,
    ];

    let cleaned = content;
    buttonPatterns.forEach(pattern => {
        cleaned = cleaned.replace(pattern, '');
    });

    return cleaned;
}

/**
 * Trim excessive whitespace
 */
function trimWhitespace(content: string): string {
    // Replace multiple newlines with max 2
    let cleaned = content.replace(/\n{3,}/g, '\n\n');

    // Remove trailing whitespace from each line
    cleaned = cleaned.replace(/[ \t]+$/gm, '');

    // Trim start and end
    return cleaned.trim();
}

/**
 * Sanitize LaTeX from LLM output
 * Fixes common issues like Unicode characters in math mode
 */
function sanitizeLLMLatex(content: string): string {
    let cleaned = content;

    // Replace Unicode ellipsis with LaTeX command in math mode
    cleaned = cleaned.replace(/\$([^$]*?)…([^$]*?)\$/g, (_, before, after) =>
        `$${before}\\ldots${after}$`);

    // Replace block math Unicode ellipsis
    cleaned = cleaned.replace(/\$\$([\s\S]*?)…([\s\S]*?)\$\$/g, (_, before, after) =>
        `$$${before}\\ldots${after}$$`);

    // Replace Unicode non-breaking spaces with regular spaces in math mode
    cleaned = cleaned.replace(/\$([^$]*?)[\u00A0\u2003]([^$]*?)\$/g, (_, b, a) =>
        `$${b} ${a}$`);

    // Replace Unicode minus with ASCII minus in math mode
    cleaned = cleaned.replace(/\$([^$]*?)−([^$]*?)\$/g, (_, b, a) =>
        `$${b}-${a}$`);

    // Replace Unicode multiplication sign with \times in math mode
    cleaned = cleaned.replace(/\$([^$]*?)×([^$]*?)\$/g, (_, b, a) =>
        `$${b}\\times${a}$`);

    // Replace Unicode division sign with \div in math mode
    cleaned = cleaned.replace(/\$([^$]*?)÷([^$]*?)\$/g, (_, b, a) =>
        `$${b}\\div${a}$`);

    return cleaned;
}

/**
 * Main preprocessing function
 */
export function preprocessMarkdown(
    content: string,
    config: PreprocessorConfig = DEFAULT_CONFIG
): string {
    let processed = content;

    if (config.removeCopyCode) {
        processed = removeCopyCodeArtifacts(processed);
    }

    if (config.removeCitations) {
        processed = removeCitations(processed);
    }

    if (config.removeButtons) {
        processed = removeButtonArtifacts(processed);
    }

    if (config.trimWhitespace) {
        processed = trimWhitespace(processed);
    }

    if (config.sanitizeLatex) {
        processed = sanitizeLLMLatex(processed);
    }

    return processed;
}

/**
 * Detect if content is from ChatGPT
 */
export function isChatGPTContent(content: string): boolean {
    const indicators = [
        /I'm (sorry|unable|happy|here|afraid)/i,
        /As an? (AI|language model)/i,
        /Copy code/,
    ];

    return indicators.some(pattern => pattern.test(content));
}

/**
 * Detect if content is from Claude
 */
export function isClaudeContent(content: string): boolean {
    const indicators = [
        /I'll (help|assist|explain)/i,
        /Let me (help|know|explain)/i,
    ];

    return indicators.some(pattern => pattern.test(content));
}
