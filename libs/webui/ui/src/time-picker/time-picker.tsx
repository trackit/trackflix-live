import { useState } from 'react';

interface TimePickerProps {
  color?: string;
}

export function TimePicker({ color }: TimePickerProps) {
  const [hour, setHour] = useState('12');
  const [minute, setMinute] = useState('00');
  const [period, setPeriod] = useState('AM'); // Optional for 12-hour format

  const hours = Array.from({ length: 12 }, (_, i) =>
    (i + 1).toString().padStart(2, '0')
  );
  const minutes = Array.from({ length: 60 }, (_, i) =>
    i.toString().padStart(2, '0')
  );

  return (
    <div className="flex items-center space-x-2">
      <div className="form-control">
        <select
          value={hour}
          onChange={(e) => setHour(e.target.value)}
          className={`select select-bordered w-20 ${color}`}
        >
          {hours.map((h) => (
            <option key={h} value={h}>
              {h}
            </option>
          ))}
        </select>
      </div>

      <div className="form-control">
        <select
          value={minute}
          onChange={(e) => setMinute(e.target.value)}
          className={`select select-bordered w-20 ${color}`}
        >
          {minutes.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
      </div>

      <div className="form-control">
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className={`select select-bordered w-20 ${color}`}
        >
          <option value="AM">AM</option>
          <option value="PM">PM</option>
        </select>
      </div>
    </div>
  );
}
