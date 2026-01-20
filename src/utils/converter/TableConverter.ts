import type { MarkdownTokens, ConversionOptions, TableCell, TableRow } from '../../types';

export class TableConverter {
  convert(
    token: MarkdownTokens,
    options: ConversionOptions,
    renderInline?: (tokens?: MarkdownTokens[], fallback?: string) => string
  ): string {
    const tableData = token.tableData;
    if (!tableData) {
      return '';
    }

    const headerRow: TableRow = {
      cells: tableData.headers,
      isHeader: true,
    };

    const headerHtml = this.convertTableRow(headerRow, options, true, renderInline);
    const bodyHtml = tableData.rows
      .map((row, rowIndex) =>
        this.convertTableRow(row, options, false, renderInline, tableData, rowIndex)
      )
      .join('\n');

    return `
      <table style="width: 100%; border-collapse: collapse; border: 1px solid ${options.table.borderColor}; margin: 12pt 0; font-family: ${options.text.fontFamily};">
        <thead style="background-color: ${options.table.headerBackground};">
          ${headerHtml}
        </thead>
        <tbody>
          ${bodyHtml}
        </tbody>
      </table>
    `;
  }

  private convertTableRow(
    row: TableRow,
    options: ConversionOptions,
    isHeader: boolean,
    renderInline?: (tokens?: MarkdownTokens[], fallback?: string) => string,
    tableData?: { rows: TableRow[] },
    rowIndex?: number
  ): string {
    const tag = isHeader ? 'th' : 'td';
    const cellsHtml = row.cells
      .map((cell, colIndex) => {
        if (options.table.enableMergedCells && cell.mergeWithPrevious) {
          return '';
        }

        const shouldMerge = options.table.enableMergedCells && tableData && rowIndex !== undefined;
        const rowspan = shouldMerge
          ? this.calculateRowspan(tableData.rows, rowIndex, colIndex)
          : cell.rowspan || 1;
        const colspan = shouldMerge
          ? this.calculateColspan(row.cells, colIndex)
          : cell.colspan || 1;
        const rowspanAttr = rowspan > 1 ? ` rowspan="${rowspan}"` : '';
        const colspanAttr = colspan > 1 ? ` colspan="${colspan}"` : '';
        const align = cell.align || options.table.defaultAlign;
        const content = renderInline ? renderInline(cell.tokens, cell.content) : cell.content;
        return `<${tag}${rowspanAttr}${colspanAttr} style="border: 1px solid ${options.table.borderColor}; padding: 6pt; text-align: ${align};">${content}</${tag}>`;
      })
      .join('');

    return `<tr>${cellsHtml}</tr>`;
  }

  private calculateRowspan(rows: TableRow[], rowIndex: number, colIndex: number): number {
    let rowspan = 1;
    for (let i = rowIndex + 1; i < rows.length; i++) {
      const cell = rows[i].cells[colIndex];
      if (cell?.mergeWithPrevious && this.isVerticalMergeMarker(cell.content)) {
        rowspan += 1;
      } else {
        break;
      }
    }
    return rowspan;
  }

  private calculateColspan(cells: TableCell[], startIndex: number): number {
    let colspan = 1;
    for (let i = startIndex + 1; i < cells.length; i++) {
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
}
