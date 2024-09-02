import Link from "next/link";
import { createContext } from "react";
import { useSources } from "./SourcesContexts";

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
        <div className="mx-16 mt-8">
          <ItemValues sourceData={{id: 1, name:"Name", description:"Description", ingestRegion:"Ingest region", status:"Status"}} clickable={false}></ItemValues>
        </div>
        <div className="mx-11 mt-8">
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

export const ItemValue: React.FC<{ value: string }> = ({ value }) => {
  return <span className="w-full text-center">{value}</span>;
}

export const ItemValues: React.FC<{ sourceData: SourceData, clickable: Boolean }> = ({ sourceData, clickable }) => {
  const { changeSourceData } = useSources();

  return (
    <div>
      {(clickable) && (
        <div className="flex border border-gray-300 rounded-xl p-2 px-5 hover:bg-gray-200 hover:shadow-sm">
          <input type="checkbox" className="mr-5" />
          <Link href={`/dashboard/sources/${sourceData.id}`} onClick={() => changeSourceData(sourceData)} className="grow">
            <div className="flex justify-between">
              <ItemValue value={sourceData.name}></ItemValue>
              <ItemValue value={sourceData.description}></ItemValue>
              <ItemValue value={sourceData.ingestRegion}></ItemValue>
              <ItemValue value={sourceData.status}></ItemValue>
            </div>
          </Link>
        </div>
      ) || (
        <div className="flex justify-between">
          <div className="mr-8" />
          <ItemValue value={sourceData.name}></ItemValue>
          <ItemValue value={sourceData.description}></ItemValue>
          <ItemValue value={sourceData.ingestRegion}></ItemValue>
          <ItemValue value={sourceData.status}></ItemValue>
        </div>
      )}
     </div>
  );
};

export const ItemValuesList: React.FC<{ sourceDatas: SourceData[] }> = ({ sourceDatas }) => {
  return (
    <div className="space-y-4">
      {sourceDatas.map((sourceData) => (
        <ItemValues key={sourceData.name} sourceData={sourceData} clickable={true}></ItemValues>
      ))}
    </div>
  );
};
