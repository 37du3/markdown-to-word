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

  private async convertToken(token: MarkdownTokens, options: ConversionOptions): Promise<(Paragraph | Table)[]> {
    switch (token.type) {
      case 'heading':
        return [this.convertHeading(token)];
      case 'paragraph':
        return [this.convertParagraph(token, options)];
      case 'code':
        return this.convertCodeBlock(token);
      case 'list':
        return this.convertList(token, options);
      case 'table':
        return [this.convertTable(token, options)];
      default:
        return [];
    }
  }

  private convertHeading(token: MarkdownTokens): Paragraph {
    const level = token.depth || 1;
    const text = token.text || '';

    return new Paragraph({
      text,
      heading: this.getHeadingLevel(level),
    });
  }

  private convertParagraph(token: MarkdownTokens, options: ConversionOptions): Paragraph {
    const runs = this.createRuns(token.tokens || [], options);

    // Check if we need to apply paragraph-level font settings if runs are empty or generic?
    // The runs will carry their own font/size. But we might want to ensure defaults.
    // TextRun usually takes defaults from Paragraph style if not specified, 
    // but here we specify explicit font/size in createRuns.

    return new Paragraph({
      children: runs,
      spacing: {
        after: 120, // 8pt roughly
        line: 240 * options.text.lineHeight,
      },
      alignment: "both", // justify
    });
  }

  private createRuns(
    tokens: MarkdownTokens[],
    options: ConversionOptions,
    modifiers: { bold?: boolean; italics?: boolean; strike?: boolean; color?: string; font?: string } = {}
  ): TextRun[] {
    if (!tokens || tokens.length === 0) return [];

    return tokens.flatMap((token) => {
      const currentFont = modifiers.font || options.text.fontFamily;
      const currentSize = options.text.fontSize * 2; // half-points

      if (token.type === 'text' || token.type === 'escape') {
        return [new TextRun({
          text: token.text || token.raw || '',
          bold: modifiers.bold,
          italics: modifiers.italics,
          strike: modifiers.strike,
          color: modifiers.color || "000000",
          font: currentFont,
          size: currentSize,
        })];
      }

      if (token.type === 'strong') {
        return this.createRuns(token.tokens || [], options, { ...modifiers, bold: true });
      }

      if (token.type === 'em') {
        return this.createRuns(token.tokens || [], options, { ...modifiers, italics: true });
      }

      if (token.type === 'del') {
        return this.createRuns(token.tokens || [], options, { ...modifiers, strike: true });
      }

      if (token.type === 'codespan') {
        return [new TextRun({
          text: token.text || '',
          font: options.code.fontFamily,
          size: options.code.fontSize * 2,
          highlight: "lightGray", // simple highlight for inline code
        })];
      }

      if (token.type === 'link') {
        // For simplicity, we make link blue and underlined text. 
        // Real Docx links need strict relationship IDs. 
        // docx library `ExternalHyperlink` requires children.
        // We can treat it as styled text for now or implement proper links.
        // Let's implement styled text first as "ExternalHyperlink" can be complex in this recursive struct.
        // Actually, `docx` has ExternalHyperlink.
        // But returning TextRun[] excludes ExternalHyperlink (which is a Paragraph child, not TextRun sibling directly? No, it looks like it can be child of Paragraph).
        // But createRuns returns TextRun[].
        // We might need to return (TextRun | ExternalHyperlink)[].
        // Let's stick to styled text for link for now to match strict return type or update return type.
        return this.createRuns(token.tokens || [], options, { ...modifiers, color: options.text.linkColor.replace('#', '') });
      }

      if (token.type === 'image') {
        // Inline images are hard. Skipping for now or TODO.
        return [];
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

      // Fallback for nested structural tokens or unknowns
      if (token.tokens) {
        return this.createRuns(token.tokens, options, modifiers);
      }

      // Fallback for raw text
      if (token.text || token.raw) {
        return [new TextRun({
          text: token.text || token.raw || '',
          bold: modifiers.bold,
          italics: modifiers.italics,
          font: currentFont,
          size: currentSize,
        })];
      }

      return [];
    });
  }

  // Legacy method wrapper if needed, or we remove it. 
  // We remove convertInlineText as it is replaced by createRuns.

  private async convertCodeBlock(token: MarkdownTokens): Promise<Paragraph[]> {
    const code = token.text || '';
    const language = token.lang || '';

    // Handle Mermaid Diagrams
    if (language === 'mermaid') {
      try {
        const { buffer, width, height } = await MermaidRenderer.renderToBuffer(code);

        // Max width in Word (roughly) is around 600px (approx 6 inches)
        // We'll constrain it if it's too huge, but Docx ImageRun usually uses EMUs or px.
        // Let's use standard transformation.

        return [new Paragraph({
          children: [
            new ImageRun({
              data: buffer,
              transformation: {
                width: width,
                height: height,
              },
            }),
          ],
        })];
      } catch (error) {
        console.warn('Failed to render mermaid diagram, falling back to code block', error);
        // Fallback to normal code block logic
      }
    }

    return [new Paragraph({
      text: token.text || '',
      style: 'Code',
    })];
  }

  private convertList(token: MarkdownTokens, options: ConversionOptions): Paragraph[] {
    if (!token.items) return [];
    return token.items.map((item) =>
      new Paragraph({
        children: this.createRuns(item.tokens || [], options),
      })
    );
  }

  private convertTable(token: MarkdownTokens, options: ConversionOptions): Table {
    const tableData = token.tableData;
    if (!tableData) {
      return new Table({ rows: [] });
    }

    const headerRow = new TableRow({
      tableHeader: true,
      children: tableData.headers
        .map((cell, colIndex) => {
          if (options.table.enableMergedCells && cell.mergeWithPrevious) {
            return null;
          }

          const colSpan = options.table.enableMergedCells
            ? this.calculateColspan(tableData.headers, colIndex)
            : cell.colspan || 1;

          return new TableCell({
            columnSpan: colSpan > 1 ? colSpan : undefined,
            shading: {
              fill: "E0E0E0", // Light gray header background
              color: "auto",
            },
            children: [
              new Paragraph({
                alignment: "center", // Center headers usually
                children: this.createRuns(cell.tokens || [], options, { bold: true }),
              }),
            ],
          });
        })
        .filter(Boolean) as TableCell[],
    });

    const bodyRows = tableData.rows.map((row, rowIndex) => {
      // Banded Rows Logic
      const isOddRow = rowIndex % 2 === 1;
      const rowFill = isOddRow ? "F9F9F9" : "FFFFFF";

      return new TableRow({
        children: row.cells
          .map((cell, colIndex) => {
            if (options.table.enableMergedCells && cell.mergeWithPrevious) {
              return null;
            }

            const cleanContent = cell.content.trim();
            // Simple numeric heuristic: numbers, commas, decimals, percent
            const isNumeric = /^[-+]?(\d{1,3}(,\d{3})*(\.\d+)?|\d+(\.\d+)?)%?$/.test(cleanContent);
            const align = cell.align
              ? (cell.align === 'right' ? "right" : cell.align === 'center' ? "center" : "left")
              : (isNumeric ? "right" : "left"); // Default alignment

            const rowSpan = options.table.enableMergedCells
              ? this.calculateRowspan(tableData.rows, rowIndex, colIndex)
              : cell.rowspan || 1;
            const colSpan = options.table.enableMergedCells
              ? this.calculateColspan(row.cells, colIndex)
              : cell.colspan || 1;

            return new TableCell({
              rowSpan: rowSpan > 1 ? rowSpan : undefined,
              columnSpan: colSpan > 1 ? colSpan : undefined,
              shading: {
                fill: rowFill,
                color: "auto",
              },
              children: [
                new Paragraph({
                  alignment: align as any,
                  children: this.createRuns(cell.tokens || [], options),
                }),
              ],
            });
          })
          .filter(Boolean) as TableCell[],
      });
    });

    return new Table({
      rows: [headerRow, ...bodyRows],
      width: {
        size: 100,
        type: "pct",
      },
    });
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

  private calculateRowspan(rows: { cells: { content: string; mergeWithPrevious?: boolean }[] }[], rowIndex: number, colIndex: number): number {
    let rowspan = 1;
    for (let i = rowIndex + 1; i < rows.length; i += 1) {
      const cell = rows[i].cells[colIndex];
      if (cell?.mergeWithPrevious && this.isVerticalMergeMarker(cell.content)) {
        rowspan += 1;
      } else {
        break;
      }
    }
    return rowspan;
  }

  private calculateColspan(cells: { content: string; mergeWithPrevious?: boolean }[], startIndex: number): number {
    let colspan = 1;
    for (let i = startIndex + 1; i < cells.length; i += 1) {
      const cell = cells[i];
      if (cell?.mergeWithPrevious && this.isHorizontalMergeMarker(cell.content)) {
        colspan += 1;
      } else {
        break;
      }
    }
    return colspan;
  }

  private isVerticalMergeMarker(content: string): boolean {
    return ['↑', '同上'].includes(content.trim());
  }

  private isHorizontalMergeMarker(content: string): boolean {
    return ['→', '同左'].includes(content.trim());
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
