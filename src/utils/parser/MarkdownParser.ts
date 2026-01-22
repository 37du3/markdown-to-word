/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-argument */
import { marked } from 'marked';
import markedKatex from 'marked-katex-extension';
import type { MarkdownAST, MarkdownTokens } from '../../types';
import { TableProcessor } from './TableProcessor';
import { AICleaner } from './AICleaner';

export class MarkdownParser {
  private marked: marked.Marked;
  private tableProcessor: TableProcessor;

  constructor() {
    this.marked = marked;
    this.tableProcessor = new TableProcessor();
    this.configureMarked();
  }

  private configureMarked(): void {
    this.marked.setOptions({
      gfm: true,
      breaks: false,
      pedantic: false,
    });
    this.marked.use(markedKatex({ throwOnError: false }));
  }

  parse(markdown: string): MarkdownAST {
    if (!markdown || typeof markdown !== 'string') {
      return {
        type: 'root',
        tokens: [],
        raw: '',
      };
    }

    try {
      const cleanedMarkdown = AICleaner.cleanAIArtifacts(markdown);
      const tokens = this.marked.lexer(cleanedMarkdown).map((token) => {
        if (token.type === 'table') {
          return {
            ...token,
            tableData: this.tableProcessor.processTable(token),
          };
        }
        return token;
      });
      return {
        type: 'root',
        tokens: tokens as MarkdownTokens,
        raw: markdown,
      };
    } catch (error) {
      console.error('Markdown parse error:', error);
      return {
        type: 'root',
        tokens: [],
        raw: markdown,
      };
    }
  }

  parseInline(markdown: string): MarkdownTokens {
    if (!markdown || typeof markdown !== 'string') {
      return [];
    }

    try {
      const tokens = this.marked.lexer(markdown);
      return tokens as MarkdownTokens;
    } catch (error) {
      console.error('Inline markdown parse error:', error);
      return [];
    }
  }

  getStats(markdown: string): {
    headings: number;
    paragraphs: number;
    lists: number;
    codeBlocks: number;
    tables: number;
    links: number;
    images: number;
  } {
    const ast = this.parse(markdown);
    const stats = {
      headings: 0,
      paragraphs: 0,
      lists: 0,
      codeBlocks: 0,
      tables: 0,
      links: 0,
      images: 0,
    };

    const countTokens = (tokens: MarkdownTokens): void => {
      if (!tokens) return;

      for (const token of tokens) {
        switch (token.type) {
          case 'heading':
            stats.headings++;
            break;
          case 'paragraph':
            stats.paragraphs++;
            break;
          case 'list':
            stats.lists++;
            break;
          case 'code':
            stats.codeBlocks++;
            break;
          case 'table':
            stats.tables++;
            break;
          case 'link':
            stats.links++;
            break;
          case 'image':
            stats.images++;
            break;
        }

        if (token.tokens && Array.isArray(token.tokens)) {
          countTokens(token.tokens as MarkdownTokens);
        }

        if (token.items && Array.isArray(token.items)) {
          token.items.forEach(item => {
            if (item.tokens) {
              countTokens(item.tokens as MarkdownTokens);
            }
          });
        }

        if (token.rows && Array.isArray(token.rows)) {
          token.rows.forEach(row => {
            if (row && Array.isArray(row)) {
              row.forEach(cell => {
                if (cell && cell.tokens) {
                  countTokens(cell.tokens as MarkdownTokens);
                }
              });
            }
          });
        }
      }
    };

    countTokens(ast.tokens);
    return stats;
  }
}
