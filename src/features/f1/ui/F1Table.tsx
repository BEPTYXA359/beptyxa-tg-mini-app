import type { ReactNode } from 'react';

interface F1TableProps<Row, Key extends string> {
  label: string;
  columns: Array<{ key: Key; label: string }>;
  rows: Row[];
  rowKey: (row: Row) => string | number;
  cell: (row: Row, key: Key) => ReactNode;
}

export function F1Table<Row, Key extends string>({
  label,
  columns,
  rows,
  rowKey,
  cell,
}: F1TableProps<Row, Key>) {
  return (
    <div className="f1-table-scroll" role="region" aria-label={label} tabIndex={0}>
      <table className="f1-table">
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key} scope="col">
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={rowKey(row)}>
              {columns.map((column) => (
                <td key={column.key}>{cell(row, column.key)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
