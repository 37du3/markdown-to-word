import type { MarkdownAST, MarkdownTokens, ConversionOptions } from '../../types';
import { TableConverter } from './TableConverter';
import { CodeBlockConverter } from './CodeBlockConverter';
import katex from 'katex';
import { stripMathDelimiters } from '../math/MathText';
import { latexToUnicodeMath } from '../math/UnicodeMathConverter';

export class HtmlConverter {
  private tableConverter: TableConverter;
  private codeBlockConverter: CodeBlockConverter;

  constructor() {
    this.tableConverter = new TableConverter();
    this.codeBlockConverter = new CodeBlockConverter();
  }

  convert(ast: MarkdownAST, options: ConversionOptions): string {
    const parts = ast.tokens.map((token) => this.convertToken(token, options));
    return parts.join('\n');
  }

  private convertToken(token: MarkdownTokens, options: ConversionOptions): string {
    switch (token.type) {
      case 'heading':
        return this.convertHeading(token, options);
      case 'paragraph':
        return this.convertParagraph(token, options);
      case 'code':
        return this.codeBlockConverter.convert(token, options);
      case 'table':
        return this.tableConverter.convert(token, options, (tokens, fallback) => {
          if (tokens && tokens.length > 0) {
            return this.convertInline(tokens, options);
          }
          return fallback || '';
        });
      case 'math':
      case 'inlineMath':
      case 'inlineKatex':
      case 'blockKatex':
        return this.convertMath(token, options);
      case 'list':
        return this.convertList(token, options);
      case 'blockquote':
        return this.convertBlockquote(token, options);
      case 'link':
        return this.convertLink(token, options);
      case 'strong':
        return `<strong>${this.convertInline(token.tokens || [], options)}</strong>`;
      case 'em':
        return `<em>${this.convertInline(token.tokens || [], options)}</em>`;
      case 'del':
        return `<del>${this.convertInline(token.tokens || [], options)}</del>`;
      case 'codespan':
        return `<code style="font-family: ${options.code.fontFamily};">${token.text || ''}</code>`;
      case 'br':
        return '<br>';
      case 'text':
        // CRITICAL: Check for nested tokens before using text
        // This handles cases where a text token contains inline formatting
        if (token.tokens && token.tokens.length > 0) {
          return this.convertInline(token.tokens, options);
        }
        return token.text || '';
      default:
        return token.raw || '';
    }
  }

  private convertHeading(token: MarkdownTokens, options: ConversionOptions): string {
    const level = token.depth || 1;
    const size = this.getHeadingSize(level, options);
    const text = this.convertInline(token.tokens || [], options);

    return `<h${level} style="font-size: ${size}pt; font-weight: 700; margin: 24pt 0 12pt; font-family: ${options.heading.fontFamily};">${text}</h${level}>`;
  }

  private convertParagraph(token: MarkdownTokens, options: ConversionOptions): string {
    const text = this.convertInline(token.tokens || [], options);
    return `<p style="font-size: ${options.text.fontSize}pt; line-height: ${options.text.lineHeight}; margin: 8pt 0; text-align: left; font-family: ${options.text.fontFamily};">${text}</p>`;
  }

  private convertList(token: MarkdownTokens, options: ConversionOptions): string {
    const tag = token.ordered ? 'ol' : 'ul';
    const items = token.items?.map((item) => {
      const content = this.convertInline(item.tokens || [], options);
      return `<li style="margin: 4pt 0; font-family: ${options.text.fontFamily};">${content}</li>`;
    }).join('') || '';

    return `<${tag} style="margin: 8pt 0; padding-left: 24pt;">${items}</${tag}>`;
  }

  private convertBlockquote(token: MarkdownTokens, options: ConversionOptions): string {
    const text = this.convertInline(token.tokens || [], options);
    return `<blockquote style="border-left: 3px solid #e5e7eb; padding-left: 12pt; margin: 12pt 0; font-family: ${options.text.fontFamily};">${text}</blockquote>`;
  }

  private convertLink(token: MarkdownTokens, options: ConversionOptions): string {
    const text = token.text || '';
    const href = (token as unknown as { href?: string }).href || text;
    return `<a href="${href}" style="color: ${options.text.linkColor}; text-decoration: underline;">${text || href}</a>`;
  }

  private convertInline(tokens: MarkdownTokens[], options: ConversionOptions): string {
    return tokens.map((token) => this.convertToken(token, options)).join('');
  }

  private convertMath(token: MarkdownTokens, options: ConversionOptions): string {
    const latexSource = this.getMathSource(token);
    const isBlock = token.type === 'math' || token.type === 'blockKatex';

    if (options.math.output === 'katex') {
      return katex.renderToString(latexSource, {
        displayMode: isBlock,
        throwOnError: false,
      });
    }

    if (options.math.output === 'latex') {
      return `<span>${token.raw || this.wrapMath(latexSource, isBlock)}</span>`;
    }

    if (options.math.output === 'unicodemath') {
      return `<span>${latexToUnicodeMath(latexSource)}</span>`;
    }

    return `<span>${stripMathDelimiters(this.wrapMath(latexSource, isBlock))}</span>`;
  }

  private getMathSource(token: MarkdownTokens): string {
    if (token.text) return token.text;
    if (token.raw) return stripMathDelimiters(token.raw);
    return '';
  }

  private wrapMath(latex: string, isBlock: boolean): string {
    if (!latex) return '';
    return isBlock ? `$$${latex}$$` : `$${latex}$`;
  }

  private getHeadingSize(level: number, options: ConversionOptions): number {
    const sizes = [
      options.heading.h1Size,
      options.heading.h2Size,
      options.heading.h3Size,
      options.heading.h4Size,
      options.heading.h5Size,
      options.heading.h6Size,
    ];
    return sizes[Math.min(level - 1, 5)];
  }
}
