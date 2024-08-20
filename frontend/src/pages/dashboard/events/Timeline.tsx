import { DateTime } from "luxon";
import { calculatePercentage } from "./Grid";

const CurrentTimeBar = () => {
  const currentTime = DateTime.now();
  const percentage = calculatePercentage(currentTime.toString());


  return (
    <div
      className="absolute flex flex-col top-1 bottom-0 z-10"
      style={{ left: `${percentage}%` }}
    >
      <span className="mb-2 transform -translate-x-1/2 mt-4">
        {currentTime.toFormat('dd/MM/yyyy HH:mm')}
      </span>
      <div className="w-0.5 bg-red-500 flex-grow"></div>
    </div>
  );
};

const Timeline = () => {
  return (
    <div className="flex flex-row pl-[10%]">
      <span>
        {DateTime.now().toFormat('dd/MM/yyyy')}
      </span>
      <CurrentTimeBar />
      <span className="ml-auto">
        {DateTime.now().plus({ days: 1 }).toFormat('dd/MM/yyyy')}
      </span>
    </div>
  );
}

export default Timeline;
