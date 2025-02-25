import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Table, TableProps } from './Table';
import { ColumnDef } from '@tanstack/react-table';
import React from 'react';
import { MemoryRouter } from 'react-router';
import '@testing-library/jest-dom';

interface TestData {
  id: string;
  name: string;
}

describe('Table Component', () => {
  const columns: ColumnDef<TestData, string>[] = [
    {
      accessorKey: 'name',
      header: 'Name',
      cell: (info) => info.getValue(),
    },
  ];

  const data: TestData[] = [
    { id: '1', name: 'John Doe' },
    { id: '2', name: 'Jane Smith' },
  ];

  const setup = (overrideProps = {}) => {
    const props: TableProps<TestData> = {
      data,
      columns,
      nextToken: undefined,
      setNextToken: vi.fn(),
      isPending: false,
      setPerPage: vi.fn(),
      perPage: 10,
      ...overrideProps,
    };

    return render(
      <MemoryRouter>
        <Table {...props} />
      </MemoryRouter>
    );
  };

  it('renders table headers and data', () => {
    setup();
    expect(screen.getByText('Name')).toBeVisible();
    expect(screen.getByText('John Doe')).toBeVisible();
    expect(screen.getByText('Jane Smith')).toBeVisible();
  });

  it('displays loading state when isPending is true', () => {
    setup({ isPending: true });
    expect(screen.getByTestId('loader')).toBeVisible();
  });

  it('handles pagination - next and previous', async () => {
    const setNextToken = vi.fn();
    setup({ setNextToken, nextToken: 'token123' });

    const nextButton = screen.getByRole('button', {
      name: 'Go to next page',
    });
    fireEvent.click(nextButton);
    await waitFor(() => expect(setNextToken).toHaveBeenCalledWith('token123'));

    const prevButton = screen.getByRole('button', {
      name: 'Go to previous page',
    });
    fireEvent.click(prevButton);
    await waitFor(() => expect(setNextToken).toHaveBeenCalledWith(undefined));
  });

  it('disables previous button on first page', () => {
    setup();
    const prevButton = screen.getByRole('button', {
      name: 'Go to previous page',
    });
    expect(prevButton).toHaveClass('btn-disabled');
  });

  it('changes rows per page when selecting a new value', () => {
    const setPerPage = vi.fn();
    setup({ setPerPage });

    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: '25' } });
    expect(setPerPage).toHaveBeenCalledWith(25);
  });
});
