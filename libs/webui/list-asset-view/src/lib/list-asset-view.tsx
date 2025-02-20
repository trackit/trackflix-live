import React, { useEffect, useMemo, useState } from 'react';
import { Panel, Table } from '@trackflix-live/ui';
import { listEvents } from '@trackflix-live/api-client';
import { ColumnDef } from '@tanstack/react-table';
import { Event } from '@trackflix-live/types';
import { adapt } from './adapt';

export function ListAssetView() {
  const [data, setData] = useState<Event[]>([]);
  const [nextToken, setNextToken] = useState<string | undefined>(undefined);

  const getListEvents = async () => {
    const events = await listEvents({
      queryStringParameters: {
        limit: '50',
        nextToken: nextToken,
      },
    });

    const adaptedData = adapt(events);

    setNextToken(adaptedData.nextToken);
    setData([...data, ...adaptedData.events]);
  };

  const columns: ColumnDef<Event>[] = useMemo(
    () => [
      {
        header: 'ID',
        accessorKey: 'id',
      },
      {
        header: 'Name',
        accessorKey: 'name',
      },
      {
        header: 'Description',
        accessorKey: 'description',
      },
    ],
    []
  );

  useEffect(() => {
    getListEvents();
  }, []);

  return (
    <Panel className={'h-[90%] max-h-[90%]'}>
      <Table
        data={data}
        columns={columns}
        nextToken={nextToken}
        getNextData={getListEvents}
      ></Table>
    </Panel>
  );
}

export default ListAssetView;
