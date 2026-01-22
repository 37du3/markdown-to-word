export class AICleaner {
  /**
   * Cleans common artifacts from AI-generated content (ChatGPT, DeepSeek, etc.)
   */
  static cleanAIArtifacts(markdown: string): string {
    if (!markdown) return '';

    let cleaned = markdown;

    // 1. Remove citation markers
    // Matches: [1], [12], 【1】, 【12】, ^1^, ^12^
    cleaned = cleaned.replace(/\[\d+\]|【\d+】|\^\d+\^/g, '');

    // 2. Remove "Copy code" button text
    // Often appears before code blocks in copied text
    cleaned = cleaned.replace(/^Copy code$/gm, '');
    cleaned = cleaned.replace(/^复制代码$/gm, '');

    // 3. Remove common conversation artifacts at start/end
    // (Conservative approach to avoid deleting user content)
    
    // Remove "Reference" or "Source" lists if they are just raw links at the bottom
    // This is tricky to do safely without false positives, so we'll stick to specific markers
    
    // 4. Fix common spacing issues
    // AI often puts citation markers right after text without space, which we just removed.
    // Sometimes it leaves double spaces.
    cleaned = cleaned.replace(/  +/g, ' ');

    return cleaned;
  }
}
