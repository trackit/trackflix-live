import Link from "next/link";
import { createContext, useMemo } from "react";
import { useSources } from "./SourcesContexts";
import { Table } from "@/components/Table";
import { Source } from "postcss";
import { ColumnDef, Row } from "@tanstack/react-table";
import { useRouter } from "next/navigation";

export type SourceData = {
  id: number;
  name: string;
  description: string;
  ingestRegion: string;
  status: string;
};

const SourcesContext = createContext({ sourceData: { name: "", description: "", ingestRegion: "", status: "" } });

export default function Sources({ children }: any) {
  const { sourceData } = useSources();

  return (
    <SourcesContext.Provider value={{ sourceData }}>
      <div>
        <div>
          <ItemValuesList sourceDatas={templateSources}></ItemValuesList>
        </div>
      </div>
    </SourcesContext.Provider>
  );
}

const templateSources = [
  { id: 1, name: "Source 1", description: "Description 1", ingestRegion: "Region 1", status: "Status 1" },
  { id: 2, name: "Source 2", description: "Description 2", ingestRegion: "Region 2", status: "Status 2" },
  { id: 3, name: "Source 3", description: "Description 3", ingestRegion: "Region 3", status: "Status 3" },
  { id: 4, name: "Source 4", description: "Description 4", ingestRegion: "Region 4", status: "Status 4" },
];

export const ItemValuesList: React.FC<{ sourceDatas: SourceData[] }> = ({ sourceDatas }) => {
  const { changeSourceData } = useSources();

  const columns: ColumnDef<Source>[] = useMemo(
    () => [
      {
        accessorKey: 'name',
        header: 'Name',
      },
      {
        accessorKey: 'description',
        header: 'Description',
      },
      {
        accessorKey: 'ingestRegion',
        header: 'Ingest region',
      },
      {
        accessorKey: 'status',
        header: 'Status',
      },
    ],
    [],
  );

  const router = useRouter()

  return (
    <div>
      <Table data={templateSources} columns={columns} onRowClick={(id: string)=> router.push(`/dashboard/sources/${id}`)}></Table>
    </div>
  );
};
