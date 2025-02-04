import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Videotape } from 'lucide-react';
import { DateTime } from 'luxon';

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
  } = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      assetUrl: '',
      startDate: DateTime.now()
        .set({ hour: DateTime.now().minute + 30 })
        .toJSDate(),
      endDate: DateTime.now()
        .set({ hour: DateTime.now().hour + 2 })
        .toJSDate(),
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className={'flex items-center'}>
        <label className={'align-middle mr-2'}>
          From
          <input
            className={'input input-bordered'}
            type={'datetime-local'}
            {...register('startDate')}
            min={DateTime.now()
              .set({ minute: DateTime.now().minute + 30 })
              .toFormat("yyyy-MM-dd'T'HH:mm")}
          />
        </label>
        <label className={'align-middle mr-2 ml-2'}>
          To
          <input
            className={'input input-bordered'}
            type={'datetime-local'}
            min={DateTime.now()
              .set({ minute: DateTime.now().minute + 30 })
              .toFormat("yyyy-MM-dd'T'HH:mm")}
            {...register('endDate')}
          />
        </label>
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
