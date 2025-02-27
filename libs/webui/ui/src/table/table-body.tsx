import { flexRender, Table } from '@tanstack/react-table';
import { useNavigate } from 'react-router';

export function TableBody<T extends { id: string }>({
  table,
}: {
  table: Table<T>;
}) {
  const navigate = useNavigate();

  return (
    <tbody>
      {table.getRowModel().rows.map((row) => (
        <tr
          key={row.id}
          className="cursor-pointer hover h-[60px]"
          onClick={() => navigate(`/status/${row.original.id}`)}
        >
          {row.getVisibleCells().map((cell) => (
            <td key={cell.id}>
              {flexRender(cell.column.columnDef.cell, cell.getContext())}
            </td>
          ))}
        </tr>
      ))}
      {table.getRowModel().rows.length === 0 && (
        <tr className="h-[80px]">
          <td
            colSpan={table.getVisibleFlatColumns().length}
            className="h-full w-full"
          >
            <div className="flex justify-center items-center h-full w-full">
              <span className="text-sm text-base-content/50">No data</span>
            </div>
          </td>
        </tr>
      )}
    </tbody>
  );
}
