import {
  ColumnDef,
  getCoreRowModel,
  getPaginationRowModel,
  PaginationState,
  useReactTable,
} from '@tanstack/react-table';
import { TableHeader } from './table-header';
import { TableBody } from './table-body';
import { useState } from 'react';

export interface TableProps<T> {
  data: T[];
  nextToken?: string;
  setNextToken: (nextToken?: string) => void;
  columns: ColumnDef<T, string>[];
  isPending: boolean;
  setPerPage: (page: number) => void;
  perPage: number;
}

export function Table<T extends { id: string }>({
  data,
  columns,
  nextToken,
  setNextToken,
  isPending,
  setPerPage,
  perPage,
}: TableProps<T>) {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 2,
  });

  const table = useReactTable({
    data: data,
    columns: columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onPaginationChange: setPagination,
    state: { pagination },
    manualPagination: true,
  });

  const [tokenMap, setTokenMap] = useState<{
    [key: number]: string | undefined;
  }>({
    0: undefined,
  });

  const updateTokenMap = (newToken: string | undefined) => {
    setTokenMap((prev) => ({
      ...prev,
      [table.getState().pagination.pageIndex + 1]: newToken,
    }));
  };

  const goToNextPage = async () => {
    const token = tokenMap[table.getState().pagination.pageIndex + 1];

    if (!token) {
      updateTokenMap(nextToken);
      setNextToken(nextToken);
      table.nextPage();
      return;
    }

    setNextToken(token);
    table.nextPage();
  };

  const goToPreviousPage = async () => {
    setNextToken(tokenMap[table.getState().pagination.pageIndex - 1]);
    table.previousPage();
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex-grow overflow-auto">
        <table className="table w-full h-full">
          <TableHeader table={table} />
          {isPending ? (
            <tbody
              className={
                'flex content-center justify-center center h-full w-full'
              }
            >
              <tr
                className="loading loading-dots loading-lg"
                data-testid="loader"
              ></tr>
            </tbody>
          ) : (
            <TableBody table={table} />
          )}
        </table>
      </div>
      <div className="flex justify-center items-center space-x-4 w-full p-4 border-t">
        <button
          aria-label={'Go to previous page'}
          className={`btn btn-outline ${
            table.getCanPreviousPage() ? '' : 'btn-disabled'
          }`}
          disabled={!table.getCanPreviousPage()}
          onClick={() => {
            goToPreviousPage();
          }}
        >
          {'<'}
        </button>
        <span className={'px-3'}>
          {table.getState().pagination.pageIndex + 1}
        </span>
        <button
          className={`btn btn-outline ${
            table.getCanNextPage() && nextToken ? '' : 'btn-disabled'
          }`}
          aria-label={'Go to next page'}
          disabled={!table.getCanNextPage() && nextToken === undefined}
          onClick={() => {
            goToNextPage();
          }}
        >
          {'>'}
        </button>
        <select
          className="select select-bordered max-w-xs"
          onChange={(e) => {
            setPerPage(+e.target.value);
          }}
        >
          <option>10</option>
          <option>25</option>
          <option>50</option>
          <option>100</option>
        </select>
      </div>
    </div>
  );
}
