import type { TableProps } from '@/types';
import {
  Table as ShadTable,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';

export const Table = <T extends Record<string, any>>({
  columns,
  data,
  emptyMessage = 'No data available',
  'data-testid': dataTestId,
}: TableProps<T>) => {
  if (data.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground" data-testid={`${dataTestId}-empty`}>
        {emptyMessage}
      </div>
    );
  }

  return (
    <div data-testid={dataTestId}>
      <ShadTable>
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHead key={column.key}>
                {column.label}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row, rowIndex) => (
            <TableRow key={rowIndex} data-testid={`${dataTestId}-row-${rowIndex}`}>
              {columns.map((column) => (
                <TableCell key={`${rowIndex}-${column.key}`}>
                  {column.render
                    ? column.render(row[column.key], row)
                    : row[column.key]}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </ShadTable>
    </div>
  );
};
