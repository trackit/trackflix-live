import React, { useMemo, useState } from 'react';
import { Panel, Table } from '@trackflix-live/ui';
import { listEvents } from '@trackflix-live/api-client';
import { ColumnDef } from '@tanstack/react-table';
import { Event, ListEventsResponse } from '@trackflix-live/types';
import { useQuery } from '@tanstack/react-query';
import { DateTime } from 'luxon';

export function ListAssetView() {
  const [nextToken, setNextToken] = useState<string | undefined>(undefined);
  const [perPage, setPerPage] = useState<number>(10);

  const { data, isPending } = useQuery<ListEventsResponse['body']>({
    queryKey: ['events', nextToken, perPage],
    queryFn: () => {
      return listEvents({
        queryStringParameters: {
          limit: perPage.toString(),
          nextToken: nextToken,
        },
      });
    },
  });

  const columns: ColumnDef<Event>[] = useMemo(
    () => [
      {
        header: 'Name',
        accessorKey: 'name',
      },
      {
        header: 'Start time',
        accessorFn: (originalRow) =>
          DateTime.fromISO(originalRow.onAirStartTime).toLocaleString(
            DateTime.DATETIME_MED
          ),
      },
      {
        header: 'End time',
        accessorFn: (originalRow) =>
          DateTime.fromISO(originalRow.onAirEndTime).toLocaleString(
            DateTime.DATETIME_MED
          ),
      },
      {
        header: 'Status',
        accessorKey: 'status',
      },
    ],
    []
  );

  return (
    <Panel className={'h-[90%] max-h-[90%]'}>
      <Table
        data={data?.events || []}
        columns={columns}
        nextToken={data?.nextToken || undefined}
        setNextToken={setNextToken}
        isPending={isPending}
        setPerPage={setPerPage}
        perPage={perPage}
      ></Table>
    </Panel>
  );
}

export default ListAssetView;
