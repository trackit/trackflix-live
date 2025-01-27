import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Videotape } from 'lucide-react';

export interface SingleAssetFormProps {
  onSubmit: (data: { assetUrl: string }) => void;
}

export function SingleAssetForm({ onSubmit }: SingleAssetFormProps) {
  const formSchema = z.object({
    assetUrl: z.string().url(),
  });

  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      assetUrl: '',
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <label className="form-control w-full">
        <label
          className={`input input-bordered flex items-center gap-2 ${
            errors.assetUrl ? 'input-error' : ''
          }`}
        >
          <Videotape />
          Asset URL
          <input
            type="text"
            className="grow"
            placeholder="https://foo.bar"
            {...register('assetUrl')}
          />
        </label>
        <div className="label">
          <span className="label-text-alt text-error">
            {errors.assetUrl?.message}
          </span>
        </div>
      </label>

      <button type="submit" className="btn btn-primary">
        Submit
      </button>
    </form>
  );
}

export default SingleAssetForm;
