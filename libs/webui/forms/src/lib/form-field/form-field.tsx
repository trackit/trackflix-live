import { z } from 'zod';
import { Videotape } from "lucide-react";
import { FieldError, Path } from "react-hook-form";
import { formSchema } from "../single-asset-form/single-asset-form";
import { UseFormRegister } from "react-hook-form";

interface FormFieldProps {
  label: string;
  register: UseFormRegister<z.infer<typeof formSchema>>;
  name: Path<z.infer<typeof formSchema>>;
  error?: FieldError;
  type?: string;
  placeholder?: string;
  options?: Array<{ value: string; label: string }>;
}

export const FormField = ({
  label, 
  register, 
  name, 
  error, 
  type = "text", 
  placeholder = "",
  options
}: FormFieldProps) => {
  return (
    <label className="form-control w-full">
      <label
        className={`flex items-center gap-2 input input-bordered ${type === "select" ? 'pr-0' : ''} ${
          error ? 'input-error' : ''
        }`}
      >
        <Videotape />
        {label}
        {type === "select" && options ? (
          <select className="select select-bordered grow" {...register(name)}>
            <div>
              </div>
              {options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
          </select>
        ) : (
          <input
            type={type}
            className="grow"
            placeholder={placeholder}
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
