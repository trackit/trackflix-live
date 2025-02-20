import { flexRender, Table } from '@tanstack/react-table';

export function TableHeader<T>({ table }: { table: Table<T> }) {
  return (
    <thead>
      {table.getHeaderGroups().map((headerGroup) => (
        <tr key={headerGroup.id} className={'flex flex-row w-full'}>
          {headerGroup.headers.map((header) => (
            <th key={header.id} className="px-6 py-3 w-1/4">
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
