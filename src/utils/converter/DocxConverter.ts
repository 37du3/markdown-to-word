/* eslint-disable */
import { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, ImageRun } from 'docx';
import type {
  MarkdownAST,
  MarkdownTokens,
  ConversionOptions,
  DocxDocumentOptions,
} from '../../types';
import { stripMathDelimiters } from '../math/MathText';
import { latexToUnicodeMath } from '../math/UnicodeMathConverter';
import { MermaidRenderer } from './MermaidRenderer';

export class DocxConverter {
  async convert(
    ast: MarkdownAST,
    options: ConversionOptions,
    docxOptions?: DocxDocumentOptions
  ): Promise<{ success: boolean; docx?: Blob; error?: Error }> {
    try {
      // Log content size for debugging
      console.log('[DocxConverter] Starting conversion, AST tokens:', ast.tokens?.length);

      // Check content size to prevent array length errors
      const astString = JSON.stringify(ast);
      const contentSize = astString.length;
      console.log('[DocxConverter] Content size (bytes):', contentSize);

      // Warn if content is very large (>10MB)
      if (contentSize > 10 * 1024 * 1024) {
        console.warn('[DocxConverter] Warning: Very large content detected, may cause issues');
      }

      // Maximum safe array length check
      if (contentSize > 100 * 1024 * 1024) {
        throw new Error(`Content too large (${Math.round(contentSize / 1024 / 1024)}MB). Maximum supported size is 100MB.`);
      }

      const children = await this.buildDocumentChildren(ast, options);
      console.log('[DocxConverter] Document children built:', children.length);

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

      console.log('[DocxConverter] Document created, packing to blob...');
      const blob = await Packer.toBlob(doc);
      console.log('[DocxConverter] Blob created successfully:', blob.size, 'bytes');
      return { success: true, docx: blob };
    } catch (error) {
      console.error('[DocxConverter] Conversion error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Docx conversion failed';
      const errorStack = error instanceof Error ? error.stack : undefined;
      console.error('[DocxConverter] Error stack:', errorStack);

      return {
        success: false,
        error: error instanceof Error ? error : new Error(errorMessage),
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
        const tableResult = this.convertTable(token, options, indentLevel);
        // convertTable now returns Paragraph[] when table is invalid
        return Array.isArray(tableResult) ? tableResult : [tableResult];
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
      alignment: "left",
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

  private convertTable(token: MarkdownTokens, options: ConversionOptions, indentLevel: number = 0): Table | Paragraph[] {
    const tableData = token.tableData;

    console.log('[convertTable] Processing table, hasTableData:', !!tableData);

    if (!tableData) {
      console.warn('[convertTable] No table data found, skipping table');
      // Return empty paragraph instead of empty table (docx doesn't allow empty tables)
      return [new Paragraph({ text: "" })];
    }

    console.log('[convertTable] Headers:', tableData.headers?.length);
    console.log('[convertTable] Rows:', tableData.rows?.length);

    // Validate table data
    if (!tableData.headers || !Array.isArray(tableData.headers)) {
      console.error('[convertTable] Invalid headers:', tableData.headers);
      return [new Paragraph({ text: "" })];
    }

    if (!tableData.rows || !Array.isArray(tableData.rows)) {
      console.error('[convertTable] Invalid rows:', tableData.rows);
      return [new Paragraph({ text: "" })];
    }

    // Check for empty table
    if (tableData.headers.length === 0) {
      console.warn('[convertTable] Empty headers, skipping table');
      return [new Paragraph({ text: "" })];
    }

    try {
      const headerRow = new TableRow({
        tableHeader: true,
        children: tableData.headers.map((cell, idx) => {
          console.log(`[convertTable] Processing header cell ${idx}:`, cell.tokens?.length || 0, 'tokens');
          return new TableCell({
            children: [new Paragraph({ children: this.createRuns(cell.tokens || [], options, { bold: true }), alignment: "center" })],
            shading: { fill: "E0E0E0" }
          });
        })
      });

      const dataRows = tableData.rows.map((row, rowIndex) => {
        console.log(`[convertTable] Processing row ${rowIndex}, cells:`, row.cells?.length || 0);

        if (!row.cells || !Array.isArray(row.cells)) {
          console.error(`[convertTable] Row ${rowIndex} has invalid cells:`, row.cells);
          // Skip invalid rows by returning placeholder
          return null;
        }

        return new TableRow({
          children: row.cells.map((cell, cellIdx) => {
            console.log(`[convertTable] Processing row ${rowIndex} cell ${cellIdx}`);
            return new TableCell({
              children: [new Paragraph({ children: this.createRuns(cell.tokens || [], options), alignment: (cell.align || "left") as any })],
              shading: { fill: rowIndex % 2 === 1 ? "F9F9F9" : "FFFFFF" }
            });
          })
        });
      }).filter(row => row !== null) as TableRow[];

      console.log('[convertTable] Creating table with', 1 + dataRows.length, 'rows');

      return new Table({
        rows: [headerRow, ...dataRows],
        width: { size: 100, type: "pct" },
        indent: indentLevel > 0 ? { size: 720 * indentLevel, type: "dxa" } : undefined,
      });
    } catch (err) {
      console.error('[convertTable] Error creating table:', err);
      console.error('[convertTable] Table data:', JSON.stringify(tableData, null, 2));
      // Return empty paragraph instead of throwing to avoid crashing whole conversion
      return [new Paragraph({ text: `[Table conversion failed]` })];
    }
  }

  private async convertBlockquote(token: MarkdownTokens, options: ConversionOptions, indentLevel: number = 0): Promise<Paragraph[]> {
    const subBlocks = await this.buildDocumentChildren({ tokens: token.tokens || [] } as any, options);
    const results: Paragraph[] = [];

    for (const sb of subBlocks) {
      if (sb instanceof Paragraph) {
        // Safe way to apply indent to existing Paragraph in this version of docx
        // Check if options exists before modifying
        if ((sb as any).options) {
          (sb as any).options.indent = { left: 720 * (indentLevel + 1) };
        }
        results.push(sb);
      }
    }
    return results;
  }

  private convertMathText(token: MarkdownTokens, options: ConversionOptions): string {
    const raw = token.raw || '';
    const text = token.text || stripMathDelimiters(raw);

    switch (options.math.output) {
      case 'latex': {
        const isBlock = token.type === 'math' || token.type === 'blockKatex';
        return raw || this.wrapMath(text, isBlock);
      }
      case 'unicodemath':
        return latexToUnicodeMath(text);
      default:
        return text;
    }
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
