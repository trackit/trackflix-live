import { DatePicker } from '../date-picker/date-picker';
import { TimePicker } from '../time-picker/time-picker';

interface TimePickerProps {
  value: Date;
  setValue: (value: Date | undefined) => void;
  color?: string;
}

export function TimeDatePicker({ color, value, setValue }: TimePickerProps) {
  return (
    <div className="flex items-center space-x-4">
      <DatePicker value={value} setValue={setValue} color={color} />
      <TimePicker
        color={color}
        value={value || new Date()}
        setValue={setValue}
      />
    </div>
  );
}
