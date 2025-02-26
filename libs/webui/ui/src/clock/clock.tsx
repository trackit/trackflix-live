import { useState, useEffect } from 'react';
import { Clock as ClockIcon } from 'lucide-react';
export function Clock() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex items-center justify-center">
      <div className="py-1 px-2 flex items-center gap-2">
        <ClockIcon className="w-4 h-4" />
        <div className="font-mono text-sm font-bold tabular-nums">
          {time.toLocaleTimeString('en-US', {
            hour12: true,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          })}
        </div>
      </div>
    </div>
  );
}

export default Clock;
