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
          className="bg-white border-b hover:bg-gray-100 cursor-pointer"
          onClick={() => navigate(`/result/${row.original.id}`)}
        >
          {row.getVisibleCells().map((cell) => (
            <td key={cell.id} className="px-6 py-4 w-1/4">
              {flexRender(cell.column.columnDef.cell, cell.getContext())}
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  );
}
