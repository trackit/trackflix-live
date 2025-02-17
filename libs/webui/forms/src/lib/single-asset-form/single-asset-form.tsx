import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Videotape,
  CaseSensitive,
  PencilLine,
  Clock,
  KeyRound,
} from 'lucide-react';
import { DateTime } from 'luxon';

export interface SingleAssetFormProps {
  onSubmit: (data: {
    name: string;
    description: string;
    s3Bucket: string;
    s3Key: string;
    onAirStartTime: Date;
    onAirEndTime: Date;
  }) => void;
  disabled?: boolean;
}

export function SingleAssetForm({ onSubmit, disabled }: SingleAssetFormProps) {
  const formSchema = z
    .object({
      name: z.string().min(1),
      description: z.string(),
      s3Bucket: z.string().min(1),
      s3Key: z.string().min(1),
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
      s3Bucket: '',
      s3Key: '',
      onAirStartTime: DateTime.now()
        .set({ hour: DateTime.now().minute + 30 })
        .toJSDate(),
      onAirEndTime: DateTime.now()
        .set({ hour: DateTime.now().hour + 2 })
        .toJSDate(),
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className={'flex items-center'}>
        <label className="form-control w-full">
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
        <label className="form-control w-full">
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

      <div className={'flex items-center'}>
        <label className={'align-middle mr-2 flex items-center gap-2'}>
          <Clock />
          <span className="mr-2">Start On Air</span>
          <input
            className={'input input-bordered'}
            type={'datetime-local'}
            {...register('onAirStartTime')}
            min={DateTime.now()
              .set({ minute: DateTime.now().minute + 30 })
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
              .set({ minute: DateTime.now().minute + 30 })
              .toFormat("yyyy-MM-dd'T'HH:mm")}
            {...register('onAirEndTime')}
          />
        </label>
      </div>
      <div className="label">
        <span className="label-text-alt text-error">
          {errors.onAirStartTime?.message}
        </span>
      </div>
      <label className="form-control w-full">
        <label
          className={`input input-bordered flex items-center gap-2 ${
            errors.s3Bucket ? 'input-error' : ''
          }`}
        >
          <Videotape />
          S3 Bucket
          <input type="text" className="grow" {...register('s3Bucket')} />
        </label>
        <div className="label">
          <span className="label-text-alt text-error">
            {errors.s3Bucket?.message}
          </span>
        </div>
      </label>
      <label className="form-control w-full">
        <label
          className={`input input-bordered flex items-center gap-2 ${
            errors.s3Key ? 'input-error' : ''
          }`}
        >
          <KeyRound />
          S3 Key
          <input type="text" className="grow" {...register('s3Key')} />
        </label>
        <div className="label">
          <span className="label-text-alt text-error">
            {errors.s3Key?.message}
          </span>
        </div>
      </label>

      <button type="submit" className="btn btn-primary" disabled={disabled}>
        Submit
      </button>
    </form>
  );
}

export default SingleAssetForm;
