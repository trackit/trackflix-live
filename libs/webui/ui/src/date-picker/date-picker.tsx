import { DayPicker } from 'react-day-picker';
import { useCallback, useEffect, useRef, useState } from 'react';
import { DateTime } from 'luxon';
import 'react-day-picker/dist/style.css';

interface DatePickerProps {
  value: Date;
  setValue: (selected: Date) => void;
  color?: string;
}

export function DatePicker({ value, setValue, color }: DatePickerProps) {
  const [showPicker, setShowPicker] = useState(false);
  const datePickerRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleDateSelect = (date: Date) => {
    setValue(date);
  };

  const closePicker = useCallback(() => {
    setShowPicker(false);
  }, [setShowPicker]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        event.target instanceof Node &&
        datePickerRef.current &&
        !datePickerRef.current.contains(event.target) &&
        inputRef.current &&
        !inputRef.current.contains(event.target)
      ) {
        closePicker();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [closePicker, showPicker]);

  return (
    <div className="relative">
      <input
        type="text"
        ref={inputRef}
        className={`input input-bordered w-full ${color} text-base-content`}
        placeholder="Select a date"
        value={DateTime.fromJSDate(value).toFormat('yyyy-MM-dd')}
        onFocus={() => setShowPicker(true)}
        readOnly
      />
      <div
        ref={datePickerRef}
        aria-label="Date picker"
        className={`absolute z-10 p-4 ${color} text-base-content border border-base-300 rounded shadow-lg mt-2 transition-all duration-200 ease-in-out ${
          showPicker
            ? 'opacity-100 scale-100 visible'
            : 'opacity-0 scale-95 invisible'
        }`}
      >
        <DayPicker
          required
          mode="single"
          selected={value}
          onSelect={handleDateSelect}
          captionLayout="dropdown"
          styles={{
            day: { color: 'inherit' },
            nav: { color: 'inherit' },
          }}
        />
      </div>
    </div>
  );
}
