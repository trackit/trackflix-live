import React, { useMemo, useState } from 'react';
import { Panel, Table, StatusBadge } from '@trackflix-live/ui';
import { listEvents } from '@trackflix-live/api-client';
import { ColumnDef } from '@tanstack/react-table';
import {
  Event,
  ListEventsRequest,
  ListEventsResponse,
  EventStatus,
} from '@trackflix-live/types';
import { useQuery } from '@tanstack/react-query';
import { DateTime } from 'luxon';
import { Search, Plus } from 'lucide-react';
import { SortingState } from '@tanstack/react-table';
import { useDebounceValue } from 'usehooks-ts';
import { useNavigate } from 'react-router';
import { PageTitle } from '@trackflix-live/ui';
export function ListEventsView() {
  const navigate = useNavigate();
  const [debouncedSearch, setDebouncedSearch] = useDebounceValue('', 500);
  const [nextToken, setNextToken] = useState<string | undefined>(undefined);
  const [perPage, setPerPage] = useState<number>(10);
  const [sorting, setSorting] = useState<SortingState>([
    {
      id: 'onAirStartTime',
      desc: true,
    },
  ]);
  const { data, isPending } = useQuery<ListEventsResponse['body']>({
    queryKey: ['events', nextToken, perPage, sorting, debouncedSearch],
    queryFn: () => {
      return listEvents({
        queryStringParameters: {
          limit: perPage.toString(),
          nextToken: nextToken,
          sortBy: sorting[0]
            ?.id as ListEventsRequest['queryStringParameters']['sortBy'],
          sortOrder: sorting[0]?.desc ? 'desc' : 'asc',
          name: debouncedSearch || '',
        },
      });
    },
    refetchInterval: 60000,
  });

  const columns: ColumnDef<Event>[] = useMemo(
    () => [
      {
        id: 'name',
        header: 'Name',
        accessorKey: 'name',
        cell: (info) => (
          <span className="font-bold">{info.getValue() as string}</span>
        ),
        size: 200,
      },
      {
        id: 'onAirStartTime',
        header: 'Start time',
        accessorFn: (originalRow) =>
          DateTime.fromISO(originalRow.onAirStartTime).toLocaleString(
            DateTime.DATETIME_MED
          ),
        size: 200,
      },
      {
        id: 'onAirEndTime',
        header: 'End time',
        accessorFn: (originalRow) =>
          DateTime.fromISO(originalRow.onAirEndTime).toLocaleString(
            DateTime.DATETIME_MED
          ),
        size: 200,
      },
      {
        id: 'status',
        header: 'Status',
        accessorKey: 'status',
        cell: (info) => (
          <div className="flex">
            <StatusBadge size="sm" status={info.getValue() as EventStatus} />
          </div>
        ),
      },
    ],
    []
  );

  return (
    <div className={'flex justify-center w-screen h-full p-8 relative'}>
      <div className={'w-full container flex flex-col gap-8'}>
        <PageTitle title="Events" />
        <div className={'flex flex-row gap-4'}>
          <label className="input input-bordered input-sm flex items-center gap-2 w-full">
            <Search className="w-4 h-4 text-base-content/50" />
            <input
              type="text"
              className="grow"
              placeholder="Search"
              defaultValue={debouncedSearch}
              onChange={(e) => setDebouncedSearch(e.target.value)}
            />
          </label>
          <button
            className="btn btn-sm btn-primary"
            onClick={() => {
              navigate('/create');
            }}
          >
            <Plus className="w-4 h-4" />
            New Event
          </button>
        </div>
        <Panel className={'max-h-[90%] !p-0'}>
          <Table
            data={data?.events || []}
            columns={columns}
            nextToken={data?.nextToken || undefined}
            setNextToken={setNextToken}
            isPending={isPending}
            setPerPage={setPerPage}
            perPage={perPage}
            sorting={sorting}
            setSorting={setSorting}
          ></Table>
        </Panel>
      </div>
    </div>
  );
}

export default ListEventsView;
