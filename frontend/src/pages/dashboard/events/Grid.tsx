import { DateTime } from "luxon";

interface GridElementProps {
  name: string;
  description: string;
  startTime: string;
  endTime: string;
}

const data = [
  {
    name: 'Race a car',
    description: 'Race car event 1',
    startTime: '2024-08-20T14:00:01+0000',
    endTime: '2024-08-20T20:30:00+0000',
  },
  {
    name: 'Race a car',
    description: 'Race car event 1',
    startTime: '2024-08-20T12:45:00+0000',
    endTime: '2024-08-20T15:57:00+0000',
  },
  {
    name: 'Race a car',
    description: 'Race car event 1',
    startTime: '2024-08-20T08:30:00+0000',
    endTime: '2024-08-20T12:30:00+0000',
  }
]

export const calculatePercentage = (dateTime: string): number => {
  const normalizedTime = DateTime.fromISO(dateTime);

  const startOfTheDay = DateTime.now().startOf('day').toMillis();
  const endOfTheDay = DateTime.now().endOf('day').toMillis();

  const currentTimeMillis = normalizedTime.toMillis();

  const totalDayMillis = endOfTheDay - startOfTheDay;

  const elapsedMillis = currentTimeMillis - startOfTheDay;

  const percentage = (elapsedMillis / totalDayMillis) * 100;

  return parseFloat(percentage.toFixed(2));
}

const calculateDuration = (startTime: string, endTime: string): string => {
  const start = DateTime.fromISO(startTime);
  const end = DateTime.fromISO(endTime);

  return end.diff(start).toFormat('hh:mm:ss');
}

const GridElement = ({ name, description, startTime, endTime }: GridElementProps) => {
  return (
    <div className="z-20 py-2">
      <button
        className={`bg-red-300 p-3 rounded-xl hover:bg-gradient-to-tr shadow-md
          hover:from-red-300 hover:to-red-400 hover:shadow-lg w-[10%]`
        }
      >
        {name}
      </button>
      <div
        className={`absolute bg-gray-300 rounded shadow-md text-center text-sm
          hover:bg-gray-400 inline-flex p-3`
        }
        style={{
          left: `${calculatePercentage(startTime)}%`,
          width: `${calculatePercentage(endTime) - calculatePercentage(startTime)}%`,
        }}
      >
        <span>
          {description}
        </span>
        <span className="ml-auto mt-auto">
          {calculateDuration(startTime, endTime)}
        </span>
      </div>
    </div>
  );
}

const Grid = () => {
  return (
    <div className="divide-y-2 divide-black/25">
      {data.map((item, idx) => (
        <GridElement
          name={item.name}
          description={item.description}
          startTime={item.startTime}
          endTime={item.endTime}
          key={`${item.name}-${idx}`}
        />
      ))}
    </div>
  );
}

export default Grid;
