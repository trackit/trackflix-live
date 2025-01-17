import { flexRender, type Table } from '@tanstack/react-table';
import React from 'react';

interface TableHeaderProps<T> {
  table: Table<T>;
}

export function TableHeader<T>({ table }: TableHeaderProps<T>) {
  return (
    <thead className="sticky top-0 bg-gray-50  z-10">
      {table.getHeaderGroups().map((headerGroup) => (
        <tr key={headerGroup.id}>
          {headerGroup.headers.map((header) => (
            <th
              key={header.id}
              className="px-3 py-3"
              style={{
                width: header.column.getSize(),
              }}
            >
              {header.isPlaceholder
                ? null
                : flexRender(
                    header.column.columnDef.header,
                    header.getContext()
                  )}
            </th>
          ))}
        </tr>
      ))}
    </thead>
  );
}
