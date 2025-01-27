import { DatePicker } from '../date-picker/date-picker';
import { useState } from 'react';

export function TimeDatePicker() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

  return (
    <div className="flex items-center space-x-4">
      <DatePicker selected={selectedDate} setSelected={setSelectedDate} />
      <input type="time" className="input input-bordered" />
    </div>
  );
}
