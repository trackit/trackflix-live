import React from 'react';
import {
  ColumnDef,
  getCoreRowModel,
  getPaginationRowModel,
  Row,
  useReactTable,
} from '@tanstack/react-table';
import { TableHeader } from './TableHeader';
import { TableBody } from './TableBody';
import { TableFooter } from './TableFooter';

interface TableProps {
  data: unknown[];
  columns: ColumnDef<any>[];
  onRowClick: (id: string) => void;
}

export function Table({ data, columns, onRowClick }: TableProps) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div>
      <table className="w-full text-sm text-left text-gray-500 mb-20">
        <TableHeader table={table} />
        <TableBody table={table} onRowClick={onRowClick} data={data} />
      </table>
      <div className="bottom-0 bg-white shadow-md fixed left-0 w-full">
        {/* <TableFooter table={table} /> */}
      </div>
    </div>
  );
}
