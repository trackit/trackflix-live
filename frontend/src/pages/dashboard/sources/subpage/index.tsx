import React from "react";
import { useSources } from "../SourcesContexts";

export default function SourceDetails() {
  const { sourceData, changeSourceData } = useSources();

  console.log("sourceData", sourceData);

  return (
    <div className="pt-10 mx-11 h-screen">
      <SourceName value={sourceData.name}></SourceName>
      <div className="flex py-6 h-3/5">
        <div className="w-full mr-6">
          <div className="pb-6 h-4/5">
            <VideoPlayer value="Video Player"></VideoPlayer>
          </div>
          <div className="h-1/5">
            <Controls value="Controls"></Controls>
          </div>
        </div>
        <SourceInformation value="SourceInformation"></SourceInformation>
      </div>
      <SourceEvents value="SourceEvents"></SourceEvents>
    </div>
  );
}

export const SourceName: React.FC<{ value: string }> = ({ value }) => {
  return <div className="w-full border border-gray-300 rounded-xl p-2 px-5">
      <span>{value}</span>
    </div>
}

export const VideoPlayer: React.FC<{ value: string }> = ({ value }) => {
  return <div className="w-full h-full border border-gray-300 rounded-xl p-2 px-5">
      <video className="w-full h-full" controls>
        {/* Template video url */}
        <source src="http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </div>
}

export const Controls: React.FC<{ value: string }> = ({ value }) => {
  return <div className="w-full h-full border border-gray-300 rounded-xl p-2 px-5">
      <span>{value}</span>
    </div>
}

export const SourceInformation: React.FC<{ value: string }> = ({ value }) => {
  return <div className="w-4/12 border border-gray-300 rounded-xl p-2 px-5">
      <span>{value}</span>
    </div>
}

export const SourceEvents: React.FC<{ value: string }> = ({ value }) => {
  return <div className="w-full h-1/4 border border-gray-300 rounded-xl p-2 px-5">
      <span>{value}</span>
    </div>
}
