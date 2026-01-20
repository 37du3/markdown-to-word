/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-argument */
import type { TableData, TableCell, TableRow } from '../../types';

export class TableProcessor {
  processTable(tableToken: any): TableData {
    if (!tableToken || !tableToken.header || !tableToken.rows) {
      return {
        headers: [],
        rows: [],
        columnCount: 0,
        rowCount: 0,
      };
    }

    const headers: TableCell[] = tableToken.header.map((cell: any) => ({
      content: this.extractText(cell),
      tokens: Array.isArray(cell?.tokens) ? cell.tokens : undefined,
      colspan: 1,
      rowspan: 1,
      raw: cell,
    }));

    const rows: TableRow[] = tableToken.rows.map((row: any[]) => ({
      cells: row.map((cell: any) => ({
        content: this.extractText(cell),
        tokens: Array.isArray(cell?.tokens) ? cell.tokens : undefined,
        colspan: 1,
        rowspan: 1,
        raw: cell,
      })),
    }));

    const tableData: TableData = {
      headers,
      rows,
      columnCount: headers.length,
      rowCount: rows.length,
    };

    this.detectMergedCells(tableData);
    return tableData;
  }

  private extractText(cell: any): string {
    if (!cell) return '';
    if (typeof cell === 'string') return cell;
    if (cell.text) return cell.text;
    if (cell.tokens) {
      return this.tokensToString(cell.tokens);
    }
    return '';
  }

  private tokensToString(tokens: any[]): string {
    if (!tokens || !Array.isArray(tokens)) return '';
    return tokens
      .map((token: any) => {
        if (token.text) return token.text;
        if (token.tokens) return this.tokensToString(token.tokens);
        return '';
      })
      .join('');
  }

  private detectMergedCells(tableData: TableData): void {
    const verticalMarkers = ['↑', '同上'];
    const horizontalMarkers = ['→', '同左'];

    for (let rowIdx = 0; rowIdx < tableData.rows.length; rowIdx++) {
      const row = tableData.rows[rowIdx];

      for (let colIdx = 0; colIdx < row.cells.length; colIdx++) {
        const cell = row.cells[colIdx];
        const content = cell.content.trim();

        if (verticalMarkers.includes(content) || horizontalMarkers.includes(content)) {
          cell.mergeWithPrevious = true;
        }
      }
    }
  }

  hasMergedCells(tableToken: any): boolean {
    const markers = ['↑', '→', '同上', '同左'];

    if (tableToken.header) {
      for (const cell of tableToken.header) {
        const text = this.extractText(cell);
        if (markers.some(marker => text.includes(marker))) {
          return true;
        }
      }
    }

    if (tableToken.rows) {
      for (const row of tableToken.rows) {
        for (const cell of row) {
          const text = this.extractText(cell);
          if (markers.some(marker => text.includes(marker))) {
            return true;
          }
        }
      }
    }

    return false;
  }
}
