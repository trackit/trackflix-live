import { z } from 'zod';
import { FieldErrors, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Videotape,
  CaseSensitive,
  PencilLine,
  Clock,
  Rocket,
} from 'lucide-react';
import { DateTime } from 'luxon';
import { ChangeEvent, useState } from 'react';
import {
  Source,
  SrtDecryptionAlgorithm,
  InputType,
} from '@trackflix-live/types';
import { FormField } from '../form-field/form-field';

export interface SingleAssetFormProps {
  onSubmit: (data: {
    name: string;
    description: string;
    source: Source;
    onAirStartTime: string;
    onAirEndTime: string;
  }) => void;
  disabled?: boolean;
}

const InputTypeDisplay: Map<keyof typeof InputType, string> = new Map([
  [InputType.MP4_FILE, 'MP4'],
  [InputType.TS_FILE, 'TS'],
  [InputType.URL_PULL, 'HLS'],
  [InputType.RTP_PUSH, 'RTP'],
  [InputType.RTMP_PUSH, 'RTMP (push)'],
  [InputType.RTMP_PULL, 'RTMP (pull)'],
  [InputType.MEDIACONNECT, 'MediaConnect'],
  [InputType.SRT_CALLER, 'SRT caller'],
]);

// Define source schemas for different input types
export const mp4SourceSchema = z.object({
  inputType: z.literal(InputType.MP4_FILE),
  value: z.string().refine((val) => /^s3:\/\/.+\.mp4$/.test(val), {
    message:
      'Must be a valid S3 URI pointing to a MP4 file (e.g., s3://bucket-name/video.mp4)',
  }),
});

export const tsSourceSchema = z.object({
  inputType: z.literal(InputType.TS_FILE),
  value: z.string().refine((val) => /^s3:\/\/.+\.ts$/.test(val), {
    message:
      'Must be a valid S3 URI pointing to a TS file (e.g., s3://bucket-name/video.ts)',
  }),
});

export const hlsSourceSchema = z.object({
  inputType: z.literal(InputType.URL_PULL),
  value: z.string().refine((val) => /^https?:\/\/.+\.m3u8$/.test(val), {
    message:
      'Must be a valid HTTP/HTTPS URL pointing to a M3U8 file (e.g., https://example.com/stream.m3u8)',
  }),
});

export const rtpPushSourceSchema = z.object({
  inputType: z.literal(InputType.RTP_PUSH),
  inputSecurityGroups: z.string(),
});

export const rtmpPushSourceSchema = z.object({
  inputType: z.literal(InputType.RTMP_PUSH),
  inputSecurityGroups: z.string(),
  streamName: z.string().optional(),
});

export const rtmpPullSourceSchema = z.object({
  inputType: z.literal(InputType.RTMP_PULL),
  url: z
    .string()
    .min(1, { message: 'URL cannot be empty' })
    .refine((val) => /^rtmp:\/\//.test(val), {
      message: 'Must be a valid RTMP URL (e.g., rtmp://example.com/live)',
    }),
  username: z.string().optional(),
  password: z.string().optional(),
});

export const mediaConnectSourceSchema = z.object({
  inputType: z.literal(InputType.MEDIACONNECT),
  flowArn: z
    .string()
    .min(1, { message: 'Flow ARN cannot be empty' })
    .refine(
      (val) =>
        /^arn:aws:mediaconnect:[a-z0-9-]+:\d{12}:flow:[^:]+:[^:]+$/.test(val),
      { message: 'Must be a valid MediaConnect Flow ARN format' }
    ),
  roleArn: z
    .string()
    .min(1, { message: 'Role ARN cannot be empty' })
    .refine((val) => /^arn:aws:iam::\d{12}:role\/[^/]+$/.test(val), {
      message: 'Must be a valid IAM Role ARN format',
    }),
});

export const srtCallerSourceSchema = z.object({
  inputType: z.literal(InputType.SRT_CALLER),
  streamId: z.string().optional(),
  srtListenerPort: z
    .string()
    .min(1, { message: 'SRT Listener Port cannot be empty' }),
  srtListenerAddress: z
    .string()
    .min(1, { message: 'SRT Listener Address cannot be empty' }),
  minimumLatency: z
    .number()
    .min(0, { message: 'Minimum Latency cannot be empty' }),
  decryptionEnabled: z.boolean().optional(),
  decryption: z
    .object({
      algorithm: z
        .enum([...Object.values(SrtDecryptionAlgorithm)] as [
          string,
          ...string[]
        ])
        .optional(),
      passphraseSecretArn: z.string().optional(),
    })
    .optional(),
});

export const formSchema = z
  .object({
    name: z.string().min(1),
    description: z.string(),
    source: z
      .discriminatedUnion('inputType', [
        mp4SourceSchema,
        hlsSourceSchema,
        tsSourceSchema,
        rtmpPushSourceSchema,
        rtmpPullSourceSchema,
        rtpPushSourceSchema,
        mediaConnectSourceSchema,
        srtCallerSourceSchema,
      ])
      .superRefine((data, ctx) => {
        if ('inputSecurityGroups' in data && !data.inputSecurityGroups) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Security Groups must be provided',
            path: ['inputSecurityGroups'],
          });
        }
        if (
          'decryptionEnabled' in data &&
          data.decryptionEnabled &&
          !data.decryption?.algorithm
        ) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message:
              'Decryption algorithm must be provided if decryption is enabled',
            path: ['decryption', 'algorithm'],
          });
        }
        if (
          'decryptionEnabled' in data &&
          data.decryptionEnabled &&
          !data.decryption?.passphraseSecretArn
        ) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message:
              'Passphrase Secret ARN must be provided if decryption is enabled',
            path: ['decryption', 'passphraseSecretArn'],
          });
        }
      }),
    onAirStartTime: z.coerce.date(),
    onAirEndTime: z.coerce.date(),
  })
  .refine((data) => data.onAirEndTime > data.onAirStartTime, {
    message: 'End date must be after start date',
    path: ['onAirStartTime'],
  });

export function SingleAssetForm({ onSubmit, disabled }: SingleAssetFormProps) {
  const [endTimeManuallySet, setEndTimeManuallySet] = useState(false);
  const [selectedInputType, setSelectedInputType] = useState<InputType>(
    InputType.MP4_FILE
  );

  const {
    register,
    formState: { errors },
    handleSubmit,
    watch,
  } = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
      source: {
        inputType: InputType.MP4_FILE,
      },
      onAirStartTime: DateTime.now()
        .set({ minute: DateTime.now().minute + 30 })
        .toJSDate(),
      onAirEndTime: DateTime.now()
        .set({ hour: DateTime.now().hour + 2 })
        .toJSDate(),
    },
  });

  const handleStartTimeChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newStartTime = new Date(e.target.value);
    register('onAirStartTime');

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
        } as ChangeEvent<HTMLInputElement>);
      }
    }
  };

  const handleEndTimeChange = (e: ChangeEvent<HTMLInputElement>) => {
    setEndTimeManuallySet(true);
    register('onAirEndTime');
  };

  const formFields = {
    s3url: (
      <FormField
        label="S3 Media URI"
        register={register}
        name="source.value"
        error={
          (errors.source as FieldErrors<z.infer<typeof mp4SourceSchema>>)?.value
        }
        placeholder="s3://bucket-name/key"
      />
    ),
    hlsUrl: (
      <FormField
        label="URL"
        register={register}
        name="source.value"
        error={
          (errors.source as FieldErrors<z.infer<typeof hlsSourceSchema>>)?.value
        }
        placeholder="https://example.com"
      />
    ),
    url: (
      <FormField
        label="URL"
        register={register}
        name="source.url"
        error={
          (errors.source as FieldErrors<z.infer<typeof rtmpPullSourceSchema>>)
            ?.url
        }
        placeholder="https://example.com"
      />
    ),
    username: (
      <FormField
        label="Username"
        register={register}
        name="source.username"
        error={
          (errors.source as FieldErrors<z.infer<typeof rtmpPullSourceSchema>>)
            ?.username
        }
      />
    ),
    password: (
      <FormField
        label="Password"
        register={register}
        name="source.password"
        error={
          (errors.source as FieldErrors<z.infer<typeof rtmpPullSourceSchema>>)
            ?.password
        }
        type="password"
      />
    ),
    inputSecurityGroups: (
      <FormField
        label="Security Groups"
        register={register}
        name="source.inputSecurityGroups"
        error={
          (errors.source as FieldErrors<z.infer<typeof rtmpPushSourceSchema>>)
            ?.inputSecurityGroups
        }
      />
    ),
    streamName: (
      <FormField
        label="Stream Name"
        register={register}
        name="source.streamName"
        error={
          (errors.source as FieldErrors<z.infer<typeof rtmpPushSourceSchema>>)
            ?.streamName
        }
        placeholder="my-stream"
      />
    ),
    roleArn: (
      <FormField
        label="Role ARN"
        register={register}
        name="source.roleArn"
        error={
          (
            errors.source as FieldErrors<
              z.infer<typeof mediaConnectSourceSchema>
            >
          )?.roleArn
        }
      />
    ),
    flowArn: (
      <FormField
        label="Flow ARN"
        register={register}
        name="source.flowArn"
        error={
          (
            errors.source as FieldErrors<
              z.infer<typeof mediaConnectSourceSchema>
            >
          )?.flowArn
        }
        placeholder="arn:aws:mediaconnect:region:account:flow:name:version"
      />
    ),
    streamId: (
      <FormField
        label="Stream ID"
        register={register}
        name="source.streamId"
        error={
          (errors.source as FieldErrors<z.infer<typeof srtCallerSourceSchema>>)
            ?.streamId
        }
      />
    ),
    srtListenerPort: (
      <FormField
        label="SRT Listener Port"
        register={register}
        name="source.srtListenerPort"
        error={
          (errors.source as FieldErrors<z.infer<typeof srtCallerSourceSchema>>)
            ?.srtListenerPort
        }
      />
    ),
    srtListenerAddress: (
      <FormField
        label="SRT Listener Address"
        register={register}
        name="source.srtListenerAddress"
        error={
          (errors.source as FieldErrors<z.infer<typeof srtCallerSourceSchema>>)
            ?.srtListenerAddress
        }
      />
    ),
    minimumLatency: (
      <FormField
        label="Minimum Latency"
        register={register}
        name="source.minimumLatency"
        error={
          (errors.source as FieldErrors<z.infer<typeof srtCallerSourceSchema>>)
            ?.minimumLatency
        }
        type="number"
      />
    ),
    srtDecryptionEnabled: (
      <FormField
        label="Enable SRT Decryption"
        type="checkbox"
        register={register}
        name="source.decryptionEnabled"
        error={
          (errors.source as FieldErrors<z.infer<typeof srtCallerSourceSchema>>)
            ?.decryptionEnabled
        }
      />
    ),
    decryptionAlgorithm: (
      <FormField
        label="Decryption Algorithm"
        register={register}
        name="source.decryption.algorithm"
        error={
          (errors.source as FieldErrors<z.infer<typeof srtCallerSourceSchema>>)
            ?.decryption?.algorithm
        }
        type="select"
        options={Object.values(SrtDecryptionAlgorithm).map((algo) => ({
          value: algo as string,
          label: algo as string,
        }))}
      />
    ),
    passphraseSecretArn: (
      <FormField
        label="Passphrase Secret ARN"
        register={register}
        name="source.decryption.passphraseSecretArn"
        error={
          (errors.source as FieldErrors<z.infer<typeof srtCallerSourceSchema>>)
            ?.decryption?.passphraseSecretArn
        }
      />
    ),
  };

  const renderSourceInputs = () => {
    switch (selectedInputType) {
      case InputType.MP4_FILE:
        return <div className="space-y-2">{formFields.s3url}</div>;
      case InputType.TS_FILE:
        return <div className="space-y-2">{formFields.s3url}</div>;

      case InputType.URL_PULL:
        return <div className="space-y-2">{formFields.hlsUrl}</div>;

      case InputType.RTP_PUSH:
        return (
          <div className="space-y-2">{formFields.inputSecurityGroups}</div>
        );

      case InputType.RTMP_PUSH:
        return (
          <div className="space-y-2">
            {formFields.inputSecurityGroups}
            {formFields.streamName}
          </div>
        );

      case InputType.RTMP_PULL:
        return (
          <div className="space-y-2">
            {formFields.url}
            {formFields.username}
            {formFields.password}
          </div>
        );

      case InputType.MEDIACONNECT:
        return (
          <div className="space-y-2">
            {formFields.flowArn}
            {formFields.roleArn}
          </div>
        );

      case InputType.SRT_CALLER:
        return (
          <div className="space-y-2">
            {formFields.streamId}
            {formFields.srtListenerPort}
            {formFields.srtListenerAddress}
            {formFields.minimumLatency}
            {formFields.srtDecryptionEnabled}
            {watch('source.decryptionEnabled') && (
              <>
                {formFields.decryptionAlgorithm}
                {formFields.passphraseSecretArn}
              </>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <form
      onSubmit={handleSubmit((data) => {
        let sourceData: Source;
        switch (data.source.inputType) {
          case InputType.MP4_FILE:
            sourceData = data.source as Source;
            break;
          case InputType.TS_FILE:
            sourceData = data.source as Source;
            break;
          case InputType.URL_PULL:
            sourceData = data.source as Source;
            break;
          case InputType.SRT_CALLER:
            if (!data.source.decryptionEnabled) {
              data.source.decryption = undefined;
            }
            if (data.source.streamId === '') data.source.streamId = undefined;
            delete data.source.decryptionEnabled;
            sourceData = data.source as Source;
            break;
          default:
            sourceData = data.source as Source;
        }

        onSubmit({
          name: data.name,
          description: data.description,
          source: {
            ...sourceData,
          },
          onAirStartTime: data.onAirStartTime.toISOString(),
          onAirEndTime: data.onAirEndTime.toISOString(),
        });
      })}
    >
      <div className={'flex items-center mb-2'}>
        <FormField
          label="Event Name"
          register={register}
          name="name"
          error={errors.name}
          icon={CaseSensitive}
        />
      </div>
      <div className={'flex items-center mb-2'}>
        <FormField
          label="Description"
          register={register}
          name="description"
          error={errors.description}
          icon={PencilLine}
        />
      </div>
      <div className="form-control w-full mb-2">
        <div className="mb-2">
          <FormField
            label="Input Type"
            register={register}
            error={errors?.source ? errors.source.inputType : undefined}
            type="select"
            icon={Videotape}
            options={Array.from(InputTypeDisplay.entries()).map(
              ([type, display]) => ({
                value: type,
                label: display,
              })
            )}
            {...register('source.inputType', {
              onChange: (e) => {
                setSelectedInputType(e.target.value);
              },
            })}
          />
        </div>

        {renderSourceInputs()}

        <div className="label">
          <span className="label-text-alt text-error">
            {errors.source?.message}
          </span>
        </div>
      </div>
      <div className={'flex mb-2 flex-col md:flex-row gap-4 items-start'}>
        <FormField
          label="Start On-Air"
          register={register}
          error={errors.onAirStartTime}
          type="datetime-local"
          icon={Clock}
          placeholder=""
          {...register('onAirStartTime', {
            onChange: handleStartTimeChange,
          })}
        />
        <FormField
          label="End On-Air"
          register={register}
          error={errors.onAirEndTime}
          type="datetime-local"
          icon={Clock}
          placeholder=""
          {...register('onAirEndTime', {
            onChange: handleEndTimeChange,
          })}
        />
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
