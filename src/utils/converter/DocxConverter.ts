/* eslint-disable */
import { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, ImageRun } from 'docx';
import type {
  MarkdownAST,
  MarkdownTokens,
  ConversionOptions,
  DocxDocumentOptions,
} from '../../types';
import { stripMathDelimiters } from '../math/MathText';
import { MermaidRenderer } from './MermaidRenderer';

export class DocxConverter {
  async convert(
    ast: MarkdownAST,
    options: ConversionOptions,
    docxOptions?: DocxDocumentOptions
  ): Promise<{ success: boolean; docx?: Blob; error?: Error }> {
    try {
      const children = await this.buildDocumentChildren(ast, options);

      const doc = new Document({
        sections: [
          {
            properties: {},
            children,
          },
        ],
        ...this.createDocumentProperties(docxOptions),
        numbering: {
          config: [
            {
              reference: 'default-numbering',
              levels: [
                {
                  level: 0,
                  format: 'decimal',
                  text: '%1.',
                  alignment: 'start',
                  style: { paragraph: { indent: { left: 720, hanging: 360 } } },
                },
                {
                  level: 1,
                  format: 'decimal',
                  text: '(%2)',
                  alignment: 'start',
                  style: { paragraph: { indent: { left: 1440, hanging: 360 } } },
                },
                {
                  level: 2,
                  format: 'lowerLetter',
                  text: '%3)',
                  alignment: 'start',
                  style: { paragraph: { indent: { left: 2160, hanging: 360 } } },
                },
              ],
            },
          ],
        },
      });

      const blob = await Packer.toBlob(doc);
      return { success: true, docx: blob };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error : new Error('Docx conversion failed'),
      };
    }
  }

  async buildDocumentChildren(ast: MarkdownAST, options: ConversionOptions): Promise<(Paragraph | Table)[]> {
    const childrenPromises = ast.tokens.map((token) => this.convertToken(token, options));
    const childrenArrays = await Promise.all(childrenPromises);
    return childrenArrays.flat().filter(Boolean) as (Paragraph | Table)[];
  }

  private async convertToken(token: MarkdownTokens, options: ConversionOptions, indentLevel: number = 0): Promise<(Paragraph | Table)[]> {
    switch (token.type) {
      case 'heading':
        return [this.convertHeading(token, options, indentLevel)];
      case 'paragraph':
        return [this.convertParagraph(token, options, indentLevel)];
      case 'code':
        return this.convertCodeBlock(token, indentLevel);
      case 'list':
        return this.convertList(token, options, indentLevel);
      case 'table':
        return [this.convertTable(token, options, indentLevel)];
      case 'blockquote':
        return this.convertBlockquote(token, options, indentLevel);
      default:
        return [];
    }
  }

  private convertHeading(token: MarkdownTokens, options: ConversionOptions, indentLevel: number = 0): Paragraph {
    const level = token.depth || 1;
    let runs = this.createRuns(token.tokens || [], options);

    if (runs.length === 0 && token.text) {
      runs = [new TextRun({
        text: token.text,
        bold: true,
        font: options.text.fontFamily,
        size: options.text.fontSize * 2,
      })];
    }

    return new Paragraph({
      children: runs,
      heading: this.getHeadingLevel(level),
      indent: indentLevel > 0 ? { left: 720 * indentLevel } : undefined,
      spacing: {
        before: 240,
        after: 120,
      },
    });
  }

  private convertParagraph(token: MarkdownTokens, options: ConversionOptions, indentLevel: number = 0): Paragraph {
    const runs = this.createRuns(token.tokens || [], options);

    return new Paragraph({
      children: runs,
      spacing: {
        after: 120,
        line: 240 * options.text.lineHeight,
      },
      alignment: "both",
      indent: indentLevel > 0 ? { left: 720 * indentLevel } : undefined,
    });
  }

  private decodeHTMLEntities(text: string): string {
    const entities: Record<string, string> = {
      '&quot;': '"',
      '&#34;': '"',
      '&apos;': "'",
      '&#39;': "'",
      '&amp;': '&',
      '&lt;': '<',
      '&gt;': '>',
      '&nbsp;': ' ',
    };
    return text.replace(/&[a-z]+;|&#\d+;/g, (entity) => entities[entity] || entity);
  }

  private createRuns(
    tokens: MarkdownTokens[],
    options: ConversionOptions,
    modifiers: { bold?: boolean; italics?: boolean; strike?: boolean; color?: string; font?: string } = {}
  ): TextRun[] {
    if (!tokens || tokens.length === 0) return [];

    return tokens.flatMap((token) => {
      const currentFont = modifiers.font || options.text.fontFamily;
      const currentSize = options.text.fontSize * 2;

      // Priority 1: Structural inline tokens (must recurse with modifiers)
      if (token.type === 'strong') {
        return this.createRuns(token.tokens || [], options, { ...modifiers, bold: true });
      }

      if (token.type === 'em') {
        return this.createRuns(token.tokens || [], options, { ...modifiers, italics: true });
      }

      if (token.type === 'del') {
        return this.createRuns(token.tokens || [], options, { ...modifiers, strike: true });
      }

      if (token.type === 'link') {
        return this.createRuns(token.tokens || [], options, { ...modifiers, color: options.text.linkColor.replace('#', '') });
      }

      // Priority 2: Specialized leaf tokens
      if (token.type === 'codespan') {
        return [new TextRun({
          text: token.text || '',
          font: options.code.fontFamily,
          size: options.code.fontSize * 2,
          highlight: "lightGray",
        })];
      }

      if (token.type === 'br') {
        return [new TextRun({ text: '', break: 1 })];
      }

      if (['math', 'inlineMath', 'inlineKatex', 'blockKatex'].includes(token.type)) {
        const text = this.convertMathText(token, options);
        return [new TextRun({
          text,
          bold: modifiers.bold,
          italics: modifiers.italics,
          font: currentFont,
          size: currentSize,
        })];
      }

      // Priority 3: Tokens with nested tokens (MUST check before using text/raw)
      if (token.tokens && token.tokens.length > 0) {
        return this.createRuns(token.tokens, options, modifiers);
      }

      // Priority 4: Leaf text nodes
      const content = token.text || token.raw || '';
      if (content) {
        const lines = content.split('\n');
        return lines.flatMap((line, i) => [
          new TextRun({
            text: this.decodeHTMLEntities(line),
            bold: modifiers.bold,
            italics: modifiers.italics,
            strike: modifiers.strike,
            color: modifiers.color || "000000",
            font: currentFont,
            size: currentSize,
            break: i > 0 ? 1 : undefined,
          })
        ]);
      }

      return [];
    });
  }

  private async convertCodeBlock(token: MarkdownTokens, indentLevel: number = 0): Promise<Paragraph[]> {
    const code = token.text || '';
    const language = token.lang || '';

    if (language === 'mermaid') {
      try {
        const { buffer, width, height } = await MermaidRenderer.renderToBuffer(code);
        return [new Paragraph({
          children: [
            new ImageRun({
              data: buffer,
              transformation: { width, height },
            }),
          ],
          indent: indentLevel > 0 ? { left: 720 * indentLevel } : undefined,
        })];
      } catch (error) {
        console.warn('Failed to render mermaid diagram', error);
      }
    }

    return [new Paragraph({
      text: token.text || '',
      style: 'Code',
      indent: indentLevel > 0 ? { left: 720 * indentLevel } : undefined,
    })];
  }

  private async convertList(token: MarkdownTokens, options: ConversionOptions, level: number = 0): Promise<Paragraph[]> {
    if (!token.items) return [];

    const results: Paragraph[] = [];
    for (const item of token.items) {
      const itemTokens = item.tokens || [];

      let inlineBuffer: MarkdownTokens[] = [];
      const flushInline = () => {
        if (inlineBuffer.length > 0) {
          const paragraphOptions: any = {
            children: this.createRuns(inlineBuffer, options),
            indent: {
              left: 720 * (level + 1),
              hanging: 360,
            },
          };

          // Apply numbering for ordered lists or bullets for unordered
          if (token.ordered) {
            paragraphOptions.numbering = {
              reference: 'default-numbering',
              level: level,
            };
          } else {
            paragraphOptions.bullet = { level: level };
          }

          results.push(new Paragraph(paragraphOptions));
          inlineBuffer = [];
        }
      };

      for (const t of itemTokens) {
        if (['text', 'strong', 'em', 'del', 'link', 'codespan', 'math', 'inlineMath', 'br'].includes(t.type)) {
          inlineBuffer.push(t);
        } else if (t.type === 'list') {
          await flushInline();
          const nested = await this.convertList(t, options, level + 1);
          results.push(...nested);
        } else if (t.type === 'paragraph') {
          await flushInline();
          results.push(this.convertParagraph(t, options, level + 1));
        } else {
          await flushInline();
          const subBlocks = await this.convertToken(t, options, level + 1);
          results.push(...(subBlocks.filter(b => b instanceof Paragraph) as Paragraph[]));
        }
      }
      await flushInline();
    }
    return results;
  }

  private convertTable(token: MarkdownTokens, options: ConversionOptions, indentLevel: number = 0): Table {
    const tableData = token.tableData;
    if (!tableData) return new Table({ rows: [] });

    return new Table({
      rows: [
        new TableRow({
          tableHeader: true,
          children: tableData.headers.map(cell => new TableCell({
            children: [new Paragraph({ children: this.createRuns(cell.tokens || [], options, { bold: true }), alignment: "center" })],
            shading: { fill: "E0E0E0" }
          }))
        }),
        ...tableData.rows.map((row, rowIndex) => new TableRow({
          children: row.cells.map(cell => new TableCell({
            children: [new Paragraph({ children: this.createRuns(cell.tokens || [], options), alignment: (cell.align || "left") as any })],
            shading: { fill: rowIndex % 2 === 1 ? "F9F9F9" : "FFFFFF" }
          }))
        }))
      ],
      width: { size: 100, type: "pct" },
      indent: indentLevel > 0 ? { size: 720 * indentLevel, type: "dxa" } : undefined,
    });
  }

  private async convertBlockquote(token: MarkdownTokens, options: ConversionOptions, indentLevel: number = 0): Promise<Paragraph[]> {
    const subBlocks = await this.buildDocumentChildren({ tokens: token.tokens || [] } as any, options);
    const results: Paragraph[] = [];

    for (const sb of subBlocks) {
      if (sb instanceof Paragraph) {
        // Safe way to apply indent to existing Paragraph in this version of docx
        // or just re-wrap it if we could. Since we can't easily, we'll use any.
        (sb as any).options.indent = { left: 720 * (indentLevel + 1) };
        results.push(sb);
      }
    }
    return results;
  }

  private convertMathText(token: MarkdownTokens, options: ConversionOptions): string {
    const raw = token.raw || '';
    const text = token.text || stripMathDelimiters(raw);

    if (options.math.output === 'latex') {
      const isBlock = token.type === 'math' || token.type === 'blockKatex';
      return raw || this.wrapMath(text, isBlock);
    }

    return text;
  }

  private wrapMath(latex: string, isBlock: boolean): string {
    if (!latex) return '';
    return isBlock ? `$$${latex}$$` : `$${latex}$`;
  }

  private getHeadingLevel(level: number): any {
    const levels = [
      HeadingLevel.HEADING_1,
      HeadingLevel.HEADING_2,
      HeadingLevel.HEADING_3,
      HeadingLevel.HEADING_4,
      HeadingLevel.HEADING_5,
      HeadingLevel.HEADING_6,
    ];
    return levels[Math.min(level - 1, 5)];
  }

  private createDocumentProperties(options?: DocxDocumentOptions) {
    if (!options) return {};
    return {
      title: options.title,
      creator: options.author,
      description: options.subject,
      keywords: options.keywords?.join(', '),
      created: options.createdAt,
      modified: options.modifiedAt,
    };
  }
}
