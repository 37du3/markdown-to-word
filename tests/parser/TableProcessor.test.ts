import { describe, it, expect } from 'vitest';
import { TableProcessor } from '../../src/utils/parser/TableProcessor';

describe('TableProcessor', () => {
  const processor = new TableProcessor();

  it('should process table with headers and rows', () => {
    const tableToken = {
      type: 'table',
      header: [
        { text: 'Name' },
        { text: 'Age' },
        { text: 'City' }
      ],
      rows: [
        [
          { text: 'John' },
          { text: '25' },
          { text: 'NYC' }
        ],
        [
          { text: 'Jane' },
          { text: '30' },
          { text: 'LA' }
        ]
      ]
    };

    const result = processor.processTable(tableToken);

    expect(result.headers).toHaveLength(3);
    expect(result.rows).toHaveLength(2);
    expect(result.columnCount).toBe(3);
    expect(result.rowCount).toBe(2);
    expect(result.headers[0].content).toBe('Name');
    expect(result.rows[0].cells[0].content).toBe('John');
  });

  it('should detect merged cells with ↑ marker', () => {
    const tableToken = {
      type: 'table',
      header: [{ text: 'A' }, { text: 'B' }],
      rows: [
        [
          { text: '1' },
          { text: '2' }
        ],
        [
          { text: '↑' },
          { text: '3' }
        ]
      ]
    };

    const result = processor.processTable(tableToken);

    expect(result.rows[1].cells[0].mergeWithPrevious).toBe(true);
  });

  it('should detect merged cells with → marker', () => {
    const tableToken = {
      type: 'table',
      header: [{ text: 'A' }, { text: 'B' }],
      rows: [
        [
          { text: '→' },
          { text: '2' }
        ]
      ]
    };

    const result = processor.processTable(tableToken);

    expect(result.rows[0].cells[0].mergeWithPrevious).toBe(true);
  });

  it('should detect merged cells with Chinese markers', () => {
    const tableToken = {
      type: 'table',
      header: [{ text: 'A' }],
      rows: [
        [
          { text: '同上' }
        ],
        [
          { text: '同左' }
        ]
      ]
    };

    const result = processor.processTable(tableToken);

    expect(result.rows[0].cells[0].mergeWithPrevious).toBe(true);
  });

  it('should handle empty table', () => {
    const tableToken = {
      type: 'table',
      header: [],
      rows: []
    };

    const result = processor.processTable(tableToken);

    expect(result.headers).toHaveLength(0);
    expect(result.rows).toHaveLength(0);
    expect(result.columnCount).toBe(0);
    expect(result.rowCount).toBe(0);
  });

  it('should return false when no merged cells', () => {
    const tableToken = {
      type: 'table',
      header: [{ text: 'A' }],
      rows: [
        [{ text: 'B' }]
      ]
    };

    expect(processor.hasMergedCells(tableToken)).toBe(false);
  });

  it('should return true when merged cells present', () => {
    const tableToken = {
      type: 'table',
      header: [{ text: 'A' }],
      rows: [
        [{ text: '↑' }]
      ]
    };

    expect(processor.hasMergedCells(tableToken)).toBe(true);
  });
});
