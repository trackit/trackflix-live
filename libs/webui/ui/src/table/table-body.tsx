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
          className="cursor-pointer hover"
          onClick={() => navigate(`/status/${row.original.id}`)}
        >
          {row.getVisibleCells().map((cell) => (
            <td key={cell.id}>
              {flexRender(cell.column.columnDef.cell, cell.getContext())}
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  );
}
