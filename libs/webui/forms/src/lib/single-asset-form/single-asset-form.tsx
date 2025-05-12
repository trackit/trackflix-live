import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Videotape,
  CaseSensitive,
  PencilLine,
  Clock,
  Rocket,
} from 'lucide-react';
import { DateTime } from 'luxon';
import { useState } from 'react';
import { InputType } from '@aws-sdk/client-medialive';

export interface SingleAssetFormProps {
  onSubmit: (data: {
    name: string;
    description: string;
    source: {
      value: string;
      inputType: InputType;
    };
    onAirStartTime: string;
    onAirEndTime: string;
  }) => void;
  disabled?: boolean;
}

export function SingleAssetForm({ onSubmit, disabled }: SingleAssetFormProps) {
  const [endTimeManuallySet, setEndTimeManuallySet] = useState(false);

  const formSchema = z
    .object({
      name: z.string().min(1),
      description: z.string(),
      source: z.object({
        value: z
          .string()
          .min(1)
          .regex(
            /^s3:\/\/[a-z0-9][a-z0-9.-]*[a-z0-9](\/.*)?$/,
            'Must be a valid S3 URI (e.g., s3://bucket-name/key)'
          ),
        inputType: z.nativeEnum(InputType),
      }),
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
      source: { value: '', inputType: InputType.MP4_FILE },
      onAirStartTime: DateTime.now()
        .set({ minute: DateTime.now().minute + 30 })
        .toJSDate(),
      onAirEndTime: DateTime.now()
        .set({ hour: DateTime.now().hour + 2 })
        .toJSDate(),
    },
  });

  const handleStartTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newStartTime = new Date(e.target.value);
    register('onAirStartTime').onChange(e);

    // Only update end time if it hasn't been manually set
    if (!endTimeManuallySet) {
      const endTime = DateTime.fromJSDate(newStartTime)
        .plus({ hours: 1 })
        .toFormat("yyyy-MM-dd'T'HH:mm");
      const endTimeInput = document.querySelector(
        'input[name="onAirEndTime"]'
      ) as HTMLInputElement;
      if (endTimeInput) {
        endTimeInput.value = endTime;
        register('onAirEndTime').onChange({
          target: { value: endTime },
        } as React.ChangeEvent<HTMLInputElement>);
      }
    }
  };

  const handleEndTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEndTimeManuallySet(true);
    register('onAirEndTime').onChange(e);
  };

  return (
    <form
      onSubmit={handleSubmit((data) => {
        onSubmit({
          ...data,
          onAirStartTime: data.onAirStartTime.toISOString(),
          onAirEndTime: data.onAirEndTime.toISOString(),
          source: data.source,
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
      <div className={'flex  mb-2 flex-col md:flex-row gap-2 items-start'}>
        <label
          className={
            'align-middle flex gap-2 md:flex-row flex-col my-2 items-start md:items-center w-full md:w-1/2'
          }
        >
          <div className="flex items-center gap-2">
            <Clock />
            <span className="mr-2 whitespace-pre">Start On-Air</span>
          </div>
          <input
            className={'input input-bordered w-full md:w-1/2'}
            type={'datetime-local'}
            {...register('onAirStartTime')}
            onChange={handleStartTimeChange}
            min={DateTime.now()
              .set({ minute: DateTime.now().minute + 6 })
              .toFormat("yyyy-MM-dd'T'HH:mm")}
          />
        </label>
        <label
          className={
            'align-middle flex  gap-2 md:flex-row flex-col my-2 items-start md:items-center w-full md:w-1/2'
          }
        >
          <div className="flex items-center gap-2">
            <Clock />
            <span className="mr-2 whitespace-pre">End On-Air</span>
          </div>
          <input
            className={'input input-bordered w-full md:w-1/2'}
            type={'datetime-local'}
            min={DateTime.now()
              .set({ minute: DateTime.now().minute + 7 })
              .toFormat("yyyy-MM-dd'T'HH:mm")}
            {...register('onAirEndTime')}
            onChange={handleEndTimeChange}
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
          <Rocket className="w-4 h-4" />
          Submit
        </button>
      </div>
    </form>
  );
}

export default SingleAssetForm;
