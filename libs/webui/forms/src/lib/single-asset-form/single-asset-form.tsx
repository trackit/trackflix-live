import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Videotape } from 'lucide-react';
import { DateTime } from 'luxon';
import { TimeDatePicker } from '@trackflix-live/ui';

export interface SingleAssetFormProps {
  onSubmit: (data: {
    assetUrl: string;
    startDate: Date;
    endDate: Date;
  }) => void;
}

export function SingleAssetForm({ onSubmit }: SingleAssetFormProps) {
  const formSchema = z
    .object({
      assetUrl: z.string().url(),
      startDate: z.coerce.date(),
      endDate: z.coerce.date(),
    })
    .refine((data) => data.endDate > data.startDate, {
      message: 'End date must be after start date',
      path: ['startDate'],
    });

  const {
    register,
    formState: { errors },
    handleSubmit,
    watch,
    setValue,
  } = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      assetUrl: '',
      startDate: new Date(),
      endDate: DateTime.now()
        .set({ hour: DateTime.now().hour + 2 })
        .toJSDate(),
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className={'flex items-center justify-between'}>
        <label className={'align-middle mr-2'}>From</label>
        <TimeDatePicker
          value={watch('startDate')}
          setValue={(date) => setValue('startDate', date)}
          color={'bg-base-100'}
        />
        <label className={'align-middle mr-2 ml-2'}>To</label>
        <TimeDatePicker
          value={watch('endDate')}
          setValue={(date) => setValue('endDate', date)}
          color={'bg-base-100'}
        />
      </div>
      <div className="label">
        <span className="label-text-alt text-error">
          {errors.startDate?.message}
        </span>
      </div>
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
