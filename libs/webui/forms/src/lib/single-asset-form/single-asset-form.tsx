import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Videotape, CaseSensitive, PencilLine, Clock } from 'lucide-react';
import { DateTime } from 'luxon';

export interface SingleAssetFormProps {
  onSubmit: (data: {
    name: string;
    description: string;
    source: string;
    onAirStartTime: string;
    onAirEndTime: string;
  }) => void;
  disabled?: boolean;
}

export function SingleAssetForm({ onSubmit, disabled }: SingleAssetFormProps) {
  const formSchema = z
    .object({
      name: z.string().min(1),
      description: z.string(),
      source: z
        .string()
        .min(1)
        .regex(
          /^s3:\/\/[a-z0-9][a-z0-9.-]*[a-z0-9](\/.*)?$/,
          'Must be a valid S3 URI (e.g., s3://bucket-name/key)'
        ),
      onAirStartTime: z.coerce.date(),
      onAirEndTime: z.coerce.date(),
    })
    .refine((data) => data.onAirEndTime > data.onAirStartTime, {
      message: 'End date must be after start date',
      path: ['onAirStartTime'],
    });

  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
      source: '',
      onAirStartTime: DateTime.now()
        .set({ hour: DateTime.now().minute + 30 })
        .toJSDate(),
      onAirEndTime: DateTime.now()
        .set({ hour: DateTime.now().hour + 2 })
        .toJSDate(),
    },
  });

  return (
    <form
      onSubmit={handleSubmit((data) => {
        onSubmit({
          ...data,
          onAirStartTime: data.onAirStartTime.toISOString(),
          onAirEndTime: data.onAirEndTime.toISOString(),
        });
      })}
    >
      <div className={'flex items-center'}>
        <label className="form-control w-full mb-2">
          <label
            className={`input input-bordered flex items-center gap-2 ${
              errors.name ? 'input-error' : ''
            }`}
          >
            <CaseSensitive />
            Event Name
            <input
              type="text"
              className="grow "
              placeholder=""
              {...register('name')}
            />
          </label>
          <div className="label">
            <span className="label-text-alt text-error">
              {errors.name?.message}
            </span>
          </div>
        </label>
      </div>
      <div className={'flex items-center'}>
        <label className="form-control w-full mb-2">
          <label
            className={`input input-bordered flex items-center gap-2 ${
              errors.description ? 'input-error' : ''
            }`}
          >
            <PencilLine />
            Description
            <input
              type="text"
              className="grow"
              placeholder=""
              {...register('description')}
            />
          </label>
          <div className="label">
            <span className="label-text-alt text-error">
              {errors.description?.message}
            </span>
          </div>
        </label>
      </div>
      <label className="form-control w-full mb-2">
        <label
          className={`input input-bordered flex items-center gap-2 ${
            errors.source ? 'input-error' : ''
          }`}
        >
          <Videotape />
          S3 Media URI
          <input
            type="text"
            className="grow"
            placeholder="s3://bucket-name/key"
            {...register('source')}
          />
        </label>
        <div className="label">
          <span className="label-text-alt text-error">
            {errors.source?.message}
          </span>
        </div>
      </label>
      <div className={'flex items-center mb-2'}>
        <label className={'align-middle mr-2 flex items-center gap-2'}>
          <Clock />
          <span className="mr-2">Start On Air</span>
          <input
            className={'input input-bordered'}
            type={'datetime-local'}
            {...register('onAirStartTime')}
            min={DateTime.now()
              .set({ minute: DateTime.now().minute + 15 })
              .toFormat("yyyy-MM-dd'T'HH:mm")}
          />
        </label>
        <label className={'align-middle mr-2 ml-2 flex items-center gap-2'}>
          <Clock />

          <span className="mr-2">End On Air</span>
          <input
            className={'input input-bordered'}
            type={'datetime-local'}
            min={DateTime.now()
              .set({ minute: DateTime.now().minute + 15 })
              .toFormat("yyyy-MM-dd'T'HH:mm")}
            {...register('onAirEndTime')}
          />
        </label>
        <div className="label">
          <span className="label-text-alt text-error">
            {errors.onAirStartTime?.message}
          </span>
        </div>
      </div>
      <div className="flex justify-end">
        <button type="submit" className="btn btn-primary" disabled={disabled}>
          Submit
        </button>
      </div>
    </form>
  );
}

export default SingleAssetForm;
