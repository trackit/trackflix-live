import React, { useEffect, useMemo, useState } from 'react';
import { Panel, Table } from '@trackflix-live/ui';
import { listEvents } from '../../../api-client/src/lib/listEvents';
import { ColumnDef } from '@tanstack/react-table';
import { Event } from '@trackflix-live/types';
import { adapt } from './adapt';

export function ListAssetView() {
  const [data, setData] = useState<Event[]>([]);
  const [nextToken, setNextToken] = useState<string | undefined>(null);

  const getListEvents = async () => {
    const events = await listEvents({
      queryStringParameters: {
        limit: '50',
      },
    });

    const adaptedData = adapt(events);

    setNextToken(adaptedData.nextToken);
    setData(adaptedData.events);
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
    <div>
      <Panel>
        <Table data={data} columns={columns}></Table>
      </Panel>
    </div>
  );
}

export default ListAssetView;
