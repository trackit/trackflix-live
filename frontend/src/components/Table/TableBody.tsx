import { flexRender, Row, Table } from '@tanstack/react-table';
import React from 'react';
import { BiLoader } from 'react-icons/bi';
import { useSources } from '@/pages/dashboard/sources/SourcesContexts';

interface TableBodyProps {
  table: Table<any>;
  onRowClick: (id: string) => void;
  data: any[];
}

export function TableBody({ table, onRowClick, data }: TableBodyProps) {
  const isPending = false;
  const isEmpty = data.length <= 0;
  const { changeSourceData } = useSources();

  return (
    <tbody>
      {!isPending &&
        !isEmpty &&
        table.getRowModel().rows.map((row) => (
          <tr
            key={row.id}
            className="bg-white border-b hover:bg-gray-100 cursor-pointer"
            onClick={() => {
              changeSourceData(row.original);
              onRowClick(row.original.id);
            }}
          >
            {row.getVisibleCells().map((cell) => (
              <td key={cell.id} className="px-6 py-4 w-1/4">
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </td>
            ))}
          </tr>
        ))}
      {isPending && (
        <tr>
          <td
            colSpan={table.getAllColumns().length}
            className="text-center p-4 align-middle"
          >
            <BiLoader />
          </td>
        </tr>
      )}
      {isEmpty && !isPending && (
        <tr>
          <td
            colSpan={table.getAllColumns().length}
            className="text-center p-4"
          >
            No results found
          </td>
        </tr>
      )}
    </tbody>
  );
}
