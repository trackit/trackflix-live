import Link from "next/link";
import { createContext } from "react";
import { useSources } from "./SourcesContexts";

export type SourceData = {
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
          <ItemValues sourceData={{name:"Name", description:"Description", ingestRegion:"Ingest region", status:"Status"}}></ItemValues>
        </div>
        <div className="mx-11 mt-8">
          <ItemValuesList sourceDatas={templateSources}></ItemValuesList>
        </div>
      </div>
    </SourcesContext.Provider>
  );
}

const templateSources = [
  { name: "Source 1", description: "Description 1", ingestRegion: "Region 1", status: "Status 1" },
  { name: "Source 2", description: "Description 2", ingestRegion: "Region 2", status: "Status 2" },
  { name: "Source 3", description: "Description 3", ingestRegion: "Region 3", status: "Status 3" },
  { name: "Source 4", description: "Description 4", ingestRegion: "Region 4", status: "Status 4" },
];

export const ItemValue: React.FC<{ value: string }> = ({ value }) => {
  return <span className="w-full text-center">{value}</span>;
}

export const ItemValues: React.FC<{ sourceData: SourceData }> = ({ sourceData }) => {
  const { changeSourceData } = useSources();

  return (
    <Link href={"/dashboard/sources/subpage"} onClick={() => changeSourceData(sourceData)}>
      <div className="flex justify-between">
        <input type="checkbox" />
        <ItemValue value={sourceData.name}></ItemValue>
        <ItemValue value={sourceData.description}></ItemValue>
        <ItemValue value={sourceData.ingestRegion}></ItemValue>
        <ItemValue value={sourceData.status}></ItemValue>
      </div>
    </Link>
  );
};

export const ItemValuesBorder: React.FC<{ sourceData: SourceData }> = ({ sourceData }) => {
  return (
    <div className="border border-gray-300 rounded-xl p-2 px-5">
      <ItemValues sourceData={sourceData}></ItemValues>
    </div>
  );
};

export const ItemValuesList: React.FC<{ sourceDatas: SourceData[] }> = ({ sourceDatas }) => {
  return (
    <div className="space-y-4">
      {sourceDatas.map((sourceData) => (
        <ItemValuesBorder key={sourceData.name} sourceData={sourceData}></ItemValuesBorder>
      ))}
    </div>
  );
};
