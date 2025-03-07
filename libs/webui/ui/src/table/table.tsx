import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  PaginationState,
  SortingState,
  useReactTable,
} from '@tanstack/react-table';
import { TableBody } from './table-body';
import { useState } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
export interface TableProps<T> {
  data: T[];
  nextToken?: string;
  setNextToken: (nextToken?: string) => void;
  columns: ColumnDef<T, string>[];
  isPending?: boolean;
  setPerPage: (page: number) => void;
  perPage: number;
  sorting?: SortingState;
  setSorting?: (sorting: SortingState) => void;
}

export function Table<T extends { id: string }>({
  data,
  columns,
  nextToken,
  setNextToken,
  isPending,
  setPerPage,
  perPage,
  sorting,
  setSorting,
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
    onSortingChange: (updater) => {
      setSorting?.(
        typeof updater === 'function' ? updater(sorting ?? []) : updater
      );
    },
    state: { pagination, sorting },
    manualPagination: true,
    manualSorting: true,
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
        <table className="table w-full">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    onClick={header.column.getToggleSortingHandler()}
                    className="cursor-pointer"
                    style={{ minWidth: header.column.columnDef.size }}
                  >
                    <div className="flex items-center gap-2">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                      {header.column.getIsSorted() ? (
                        header.column.getIsSorted() === 'asc' ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )
                      ) : null}
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          {isPending ? (
            <tbody>
              <tr>
                <td colSpan={columns.length} className="h-full w-full">
                  <div className="flex justify-center items-center h-full w-full">
                    <span className="loading loading-ring loading-lg"></span>
                  </div>
                </td>
              </tr>
            </tbody>
          ) : (
            <TableBody table={table} />
          )}
        </table>
      </div>
      <div className="flex justify-center items-center space-x-4 w-full p-4 border-t border-base-300">
        <button
          aria-label={'Go to previous page'}
          className={`btn btn-sm ${
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
          className={`btn btn-sm ${
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
          className="select select-bordered select-sm"
          value={perPage}
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
