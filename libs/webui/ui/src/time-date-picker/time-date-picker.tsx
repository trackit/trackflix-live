import { DatePicker } from '../date-picker/date-picker';
import { useState } from 'react';
import { TimePicker } from '../time-picker/time-picker';

interface TimePickerProps {
  color?: string;
}

export function TimeDatePicker({ color }: TimePickerProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

  return (
    <div className="flex items-center space-x-4">
      <DatePicker
        selected={selectedDate}
        setSelected={setSelectedDate}
        color={color}
      />
      <TimePicker color={color} />
    </div>
  );
}
