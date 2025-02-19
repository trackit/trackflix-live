import {
  ColumnDef,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { TableHeader } from './table-header';
import { TableBody } from './table-body';
import { TableFooter } from './table-footer';

export interface TableProps<T> {
  data: T[];
  columns: ColumnDef<T, string>[];
}

export function Table<T extends { id: string }>({
  data,
  columns,
}: TableProps<T>) {
  const table = useReactTable({
    data: data,
    columns: columns,
    getCoreRowModel: getCoreRowModel(),
  });

  console.log(data);

  return (
    <table>
      <TableHeader table={table} />
      <TableBody table={table} />
      <TableFooter table={table} />
    </table>
  );
}
