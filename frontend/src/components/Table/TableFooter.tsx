import React from 'react';
import { Table } from '@tanstack/react-table';

interface TableFooterProps<T> {
  table: Table<T>;
}

export function TableFooter<T>({ table }: TableFooterProps<T>) {
  const actions = useResultStore(resultStoreSelector.actions);
  const total = useResultStore(resultStoreSelector.total);
  const perPage = useResultStore(resultStoreSelector.perPage);
  const { setPageNumber } = useResultStore(resultStoreSelector.actions);

  return (
    <div className="flex items-center gap-4 py-2 justify-center">
      {/* First Page Button */}
      <button
        className={classNames(
          'px-3',
          'py-1',
          'border',
          'rounded-md',
          'text-gray-600',
          'hover:bg-gray-200',
          'disabled:text-gray-300',
          'disabled:bg-gray-50',
          'disabled:cursor-not-allowed',
          'border-gray-300',
          'bg-white'
        )}
        onClick={() => {
          setPageNumber(0);
          table.setPageIndex(0);
        }}
        disabled={!table.getCanPreviousPage()}
        type="button"
      >
        {'<<'}
      </button>
      {/* Previous Page Button */}
      <button
        className={classNames(
          'px-3',
          'py-1',
          'border',
          'rounded-md',
          'text-gray-600',
          'hover:bg-gray-200',
          'disabled:text-gray-300',
          'disabled:bg-gray-50',
          'disabled:cursor-not-allowed',
          'border-gray-300',
          'bg-white'
        )}
        onClick={() => {
          setPageNumber(table.getState().pagination.pageIndex - 1);
          table.previousPage();
        }}
        disabled={!table.getCanPreviousPage()}
        type="button"
      >
        {'<'}
      </button>

      {/* Next Page Button */}
      <button
        className={classNames(
          'px-3',
          'py-1',
          'border',
          'rounded-md',
          'text-gray-600',
          'hover:bg-gray-200',
          'disabled:text-gray-300',
          'disabled:bg-gray-50',
          'disabled:cursor-not-allowed',
          'border-gray-300',
          'bg-white'
        )}
        onClick={() => {
          const nextPage = table.getState().pagination.pageIndex + 1;
          setPageNumber(nextPage);
          table.nextPage();
        }}
        disabled={
          !table.getCanNextPage() &&
          table.getState().pagination.pageIndex < Math.ceil(total / perPage)
        }
        type="button"
      >
        {'>'}
      </button>

      {/* Last Page Button */}
      <button
        className={classNames(
          'px-3',
          'py-1',
          'border',
          'rounded-md',
          'text-gray-600',
          'hover:bg-gray-200',
          'disabled:text-gray-300',
          'disabled:bg-gray-50',
          'disabled:cursor-not-allowed',
          'border-gray-300',
          'bg-white'
        )}
        onClick={() => {
          setPageNumber(Math.ceil(total / perPage - 1));
          table.setPageIndex(table.getPageCount() - 1);
        }}
        disabled={!table.getCanNextPage()}
        type="button"
      >
        {'>>'}
      </button>

      {/* Page Indicator */}
      <span className="flex items-center gap-2 text-sm text-gray-600">
        <div>Page</div>
        <strong className="text-gray-900">
          {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
        </strong>
      </span>

      {/* Page Size Selector */}
      <select
        value={table.getState().pagination.pageSize}
        onChange={(e) => {
          actions.setPageNumber(0);
          table.setPageSize(Number(e.target.value));
          actions.setPerPage(Number(e.target.value));
        }}
        className="border rounded-md py-1 px-2 text-sm bg-white text-gray-600 hover:bg-gray-100"
      >
        {[10, 20, 30, 40, 50].map((pageSize) => (
          <option key={pageSize} value={pageSize}>
            Show {pageSize}
          </option>
        ))}
      </select>
    </div>
  );
}
