import { DayPicker } from 'react-day-picker';
import { useCallback, useEffect, useRef, useState } from 'react';
import { DateTime } from 'luxon';
import 'react-day-picker/dist/style.css';

interface DatePickerProps {
  selected: Date | undefined;
  setSelected: (selected: Date | undefined) => void;
}

export function DatePicker({ selected, setSelected }: DatePickerProps) {
  const [showPicker, setShowPicker] = useState(false);
  const datePickerRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleDateSelect = (date: Date) => {
    setSelected(date);
  };

  const closePicker = useCallback(() => {
    setTimeout(() => setShowPicker(false), 200);
  }, [setShowPicker]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        datePickerRef.current &&
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
    <div>
      <input
        type="text"
        ref={inputRef}
        className={'input input-bordered'}
        placeholder="Select a date"
        value={
          selected ? DateTime.fromJSDate(selected).toFormat('yyyy-MM-dd') : ''
        }
        onFocus={() => setShowPicker(true)}
        readOnly
      />
      <div
        ref={datePickerRef}
        className={`absolute z-10 bg-white border rounded shadow mt-2 transition-all duration-200 ease-in-out ${
          showPicker
            ? 'opacity-100 scale-100 visible'
            : 'opacity-0 scale-95 invisible'
        }`}
      >
        <DayPicker
          required
          mode="single"
          selected={selected}
          onSelect={handleDateSelect}
          captionLayout={'dropdown'}
          onDayClick={() => closePicker()}
        />
      </div>
    </div>
  );
}
