import { z } from 'zod';
import { Videotape, LucideIcon } from "lucide-react";
import { FieldError, Path } from "react-hook-form";
import { formSchema } from "../single-asset-form/single-asset-form";
import { UseFormRegister } from "react-hook-form";
import { DateTime } from "luxon";

interface FormFieldProps {
  label: string;
  register: UseFormRegister<z.infer<typeof formSchema>>;
  name: Path<z.infer<typeof formSchema>>;
  error?: FieldError;
  type?: "text" | "number" | "select" | "checkbox" | "password" | "datetime-local";
  placeholder?: string;
  options?: Array<{ value: string; label: string }>;
  icon?: LucideIcon;
}

export const FormField = ({
  label, 
  register, 
  name, 
  error, 
  type = "text", 
  placeholder = "",
  options,
  icon: Icon = Videotape
}: FormFieldProps) => {
  return (
    <label className="form-control w-full">
      <label
        className={`flex items-center gap-2 ${type !== "checkbox" ? 'input input-bordered' : ''} ${type === "select" ? 'pr-0' : ''} ${
          error ? 'input-error' : ''
        }`}
      >
        <Icon />
        {label}
        {type === "checkbox" ? (
          <input
            type="checkbox"
            className="checkbox"
            {...register(name)}
          />
        ) : type === "select" && options ? (
          <select className="select select-bordered grow" {...register(name)}>
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        ) : type === "datetime-local" ? (
          <input
            type="datetime-local"
            className="grow"
            min={DateTime.now()
              .set({ minute: DateTime.now().minute + 6 })
              .toFormat("yyyy-MM-dd'T'HH:mm")}
            {...register(name)}
          />
        ) : (
          <input
            type={type}
            className="grow"
            placeholder={placeholder}
            defaultValue={type === "number" ? 0 : undefined}
            {...register(name, {
              valueAsNumber: type === "number"
            })}
          />
        )}
      </label>
      {error && (
        <div className="label">
          <span className="label-text-alt text-error">{error.message}</span>
        </div>
      )}
    </label>
  );
};
