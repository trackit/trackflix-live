import {
  ColumnDef,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { TableHeader } from './table-header';
import { TableBody } from './table-body';

export interface TableProps<T> {
  data: T[];
  nextToken?: string;
  getNextData: () => Promise<void>;
  columns: ColumnDef<T, string>[];
}

export function Table<T extends { id: string }>({
  data,
  columns,
  nextToken,
  getNextData,
}: TableProps<T>) {
  const table = useReactTable({
    data: data,
    columns: columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div className="h-full flex flex-col">
      <div className="flex-grow overflow-auto">
        <table className="text-sm text-left w-full">
          <TableHeader table={table} />
          <TableBody table={table} />
        </table>
      </div>
      <div className="flex justify-center items-center space-x-4 w-full p-4 border-t">
        <button
          className={`btn btn-outline min-w-24 ${
            table.getCanPreviousPage() ? '' : 'btn-disabled'
          }`}
          onClick={() => {
            table.previousPage();
          }}
        >
          Previous
        </button>
        <span className={'px-3'}>
          {table.getState().pagination.pageIndex + 1}
        </span>
        <button
          className={`btn btn-outline min-w-24 ${
            table.getCanNextPage() && nextToken ? '' : 'btn-disabled'
          }`}
          onClick={() => {
            getNextData().then(() => {
              table.nextPage();
            });
          }}
        >
          Next
        </button>
      </div>
    </div>
  );
}
