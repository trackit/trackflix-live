import { useState } from 'react';
import { DateTime } from 'luxon';

interface TimePickerProps {
  value: Date;
  setValue: (value: Date) => void;
  color?: string;
}

export function TimePicker({ color, setValue, value }: TimePickerProps) {
  const [period, setPeriod] = useState('AM');

  return (
    <div className="flex items-center space-x-2">
      <input
        type="number"
        value={DateTime.fromJSDate(value).get('hour')}
        min={0}
        max={12}
        onChange={(e) => {
          const newDate = DateTime.fromJSDate(value || new Date()).set({
            hour: +e.target.value,
          });
          setValue(newDate.toJSDate());
        }}
        className={`input input-bordered w-14 ${color}`}
      ></input>

      <input
        type="number"
        value={DateTime.fromJSDate(value).get('minute')}
        onChange={(e) => {
          const newDate = DateTime.fromJSDate(value || new Date()).set({
            minute: +e.target.value,
          });
          setValue(newDate.toJSDate());
        }}
        className={`input input-bordered w-14 ${color}`}
        min={0}
        max={60}
      ></input>

      <div className="form-control">
        <select
          value={period}
          onChange={(e) => {
            setPeriod(e.target.value);
            setValue(
              updateHourWithAmPm(
                DateTime.fromJSDate(value || new Date()),
                e.target.value
              ).toJSDate()
            );
          }}
          className={`select select-bordered w-20 ${color}`}
        >
          <option value="AM">AM</option>
          <option value="PM">PM</option>
        </select>
      </div>
    </div>
  );
}

function updateHourWithAmPm(dateTime: DateTime, period: string) {
  let adjustedHour = dateTime.get('hour') % 12;
  if (period === 'PM') {
    adjustedHour += 12;
  }

  return dateTime.set({ hour: adjustedHour });
}
