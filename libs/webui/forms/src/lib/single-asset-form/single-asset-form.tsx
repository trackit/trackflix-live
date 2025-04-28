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
import { S3Source, Source, SrtDecryptionAlgorithm } from '@trackflix-live/types';
import { InputNetworkLocation, InputType } from '@aws-sdk/client-medialive';
import { FormField } from '../form-field/form-field';
import { InputType, Source } from '@trackflix-live/types';

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
const mp4SourceSchema = z.object({
  s3url: z.string()
    .refine(
      (val) => /^s3:\/\/.+\.mp4$/.test(val),
      { message: 'Must be a valid S3 URI pointing to a MP4 file (e.g., s3://bucket-name/video.mp4)' }
    ),
});

const tsSourceSchema = z.object({
  s3url: z.string()
    .refine(
      (val) => /^s3:\/\/.+\.ts$/.test(val),
      { message: 'Must be a valid S3 URI pointing to a TS file (e.g., s3://bucket-name/video.ts)' }
    ),
});

const hlsSourceSchema = z.object({
  url: z.string()
    .refine(
      (val) => /^https?:\/\/.+\.m3u8$/.test(val),
      { message: 'Must be a valid HTTP/HTTPS URL pointing to a M3U8 file (e.g., https://example.com/stream.m3u8)' }
    ),
});

const rtpPushSourceSchema = z.object({
  inputNetworkLocation: z.enum([InputNetworkLocation.AWS] as [string, ...string[]]),
  inputSecurityGroups: z.string(),
}).superRefine((data, ctx) => {
  if (data.inputNetworkLocation === InputNetworkLocation.AWS && !data.inputSecurityGroups) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Security Groups must be provided',
      path: ['inputSecurityGroups'],
    });
  }
});

const rtmpPushSourceSchema = z.object({
  inputNetworkLocation: z.enum([InputNetworkLocation.AWS] as [string, ...string[]]),
  inputSecurityGroups: z.string().optional(),
  streamName: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.inputNetworkLocation === InputNetworkLocation.AWS && !data.inputSecurityGroups) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Security Groups must be provided',
      path: ['inputSecurityGroups'],
    });
  }
});

const rtmpPullSourceSchema = z.object({
  url: z.string()
    .min(1, { message: 'URL cannot be empty' })
    .refine(
      (val) => /^rtmp:\/\//.test(val),
      { message: 'Must be a valid RTMP URL (e.g., rtmp://example.com/live)' }
    ),
  username: z.string().optional(),
  password: z.string().optional(),
});

const mediaConnectSourceSchema = z.object({
  flowArn: z.string()
    .min(1, { message: 'Flow ARN cannot be empty' })
    .refine(
      (val) => /^arn:aws:mediaconnect:[a-z0-9-]+:\d{12}:flow:[^:]+:[^:]+$/.test(val),
      { message: 'Must be a valid MediaConnect Flow ARN format' }
    ),
  roleArn: z.string()
    .min(1, { message: 'Role ARN cannot be empty' })
    .refine(
      (val) => /^arn:aws:iam::\d{12}:role\/[^/]+$/.test(val),
      { message: 'Must be a valid IAM Role ARN format' }
    ),
});

const srtCallerSourceSchema = z.object({
  streamId: z.string().min(1, { message: 'Stream ID cannot be empty' }),
  srtListenerPort: z.string().min(1, { message: 'SRT Listener Port cannot be empty' }),
  srtListenerAddress: z.string().min(1, { message: 'SRT Listener Address cannot be empty' }),
  minimumLatency: z.number().min(0, { message: 'Minimum Latency cannot be empty' }),
  decryptionEnabled: z.boolean().optional(),
  decryption: z.object({
    Algorithm: z.enum([...Object.values(SrtDecryptionAlgorithm)] as [string, ...string[]]).optional(),
    passphraseSecretArn: z.string().optional(),
  }).optional(),
}).superRefine((data, ctx) => {
  if (data.decryptionEnabled && !data.decryption?.Algorithm) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Decryption algorithm must be provided if decryption is enabled',
      path: ['decryption', 'Algorithm'],
    });
  }
  if (data.decryptionEnabled && !data.decryption?.passphraseSecretArn) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Passphrase Secret ARN must be provided if decryption is enabled',
      path: ['decryption', 'passphraseSecretArn'],
    });
  }
});

// Generic source schema that can handle any input type
const sourceSchema = z.object({
  s3url: z.string().optional()
    .refine(
      (val) => !val || /^s3:\/\/[a-z0-9][a-z0-9.-]*[a-z0-9](\/.*)?$/.test(val),
      { message: 'Must be a valid S3 URI (e.g., s3://bucket-name/key)' }
    ),
  url: z.string().optional(),
  username: z.string().optional(),
  password: z.string().optional(),
  streamName: z.string().optional(),
  inputNetworkLocation: z.enum([...Object.values(InputNetworkLocation)] as [string, ...string[]]).optional(),
  inputSecurityGroups: z.string().optional(),
  roleArn: z.string().optional(),
  flowArn: z.string().optional(),
  streamId: z.string().optional(),
  srtListenerPort: z.string().optional(),
  srtListenerAddress: z.string().optional(),
  minimumLatency: z.number().optional(),
  decryptionEnabled: z.boolean().optional(),
  decryption: z.object({
    Algorithm: z.enum([...Object.values(SrtDecryptionAlgorithm)] as [string, ...string[]]).optional(),
    passphraseSecretArn: z.string().optional(),
  }).optional(),
});

const parseWithSchema = (
  data: z.infer<typeof sourceSchema>,
  schema: z.ZodSchema,
  ctx: z.RefinementCtx,
  path?: string[]
) => {
  const result = schema.safeParse(data);
  if (!result.success) {
    result.error.errors.forEach(err => {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: err.message,
        path: path ? ['source', ...path] : ['source', err.path.join('.')],
      });
    });
  }
  console.log("RESULT", result);
  return result;
};


export const formSchema = z
  .object({
    name: z.string().min(1),
    description: z.string(),
    inputType: z.enum([...Object.values(InputType)] as [string, ...string[]]),
    source: sourceSchema,
    onAirStartTime: z.coerce.date(),
    onAirEndTime: z.coerce.date(),
  })
  .refine((data) => data.onAirEndTime > data.onAirStartTime, {
    message: 'End date must be after start date',
    path: ['onAirStartTime'],
  })
  .superRefine((data, ctx) => {
    // Validate source based on input type
    switch (data.inputType) {
      case InputType.MP4_FILE:
        parseWithSchema(data.source, mp4SourceSchema, ctx, ['s3url']);
        break;
      case InputType.TS_FILE:
        parseWithSchema(data.source, tsSourceSchema, ctx, ['s3url']);
        break;
      case InputType.URL_PULL:
        parseWithSchema(data.source, hlsSourceSchema, ctx);
        break;
      case InputType.MEDIACONNECT:
        parseWithSchema(data.source, mediaConnectSourceSchema, ctx);
        break;
      case InputType.RTP_PUSH:
        parseWithSchema(data.source, rtpPushSourceSchema, ctx);
        break;
      case InputType.RTMP_PUSH:
        parseWithSchema(data.source, rtmpPushSourceSchema, ctx);
        break;
      case InputType.RTMP_PULL:
        parseWithSchema(data.source, rtmpPullSourceSchema, ctx);
        break;
      case InputType.SRT_CALLER:
        console.log("SRT CALLER", data.source);
        parseWithSchema(data.source, srtCallerSourceSchema, ctx);
        break;
    }
  });

export function SingleAssetForm({ onSubmit, disabled }: SingleAssetFormProps) {
  const [endTimeManuallySet, setEndTimeManuallySet] = useState(false);
  const [selectedInputType, setSelectedInputType] = useState<keyof typeof InputType>(InputType.MP4_FILE);

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
    setValue,
    watch,
  } = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
      source: '',
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

  const formFields = {
    s3url: (
      <FormField
        label="S3 Media URI"
        register={register}
        name="source.s3url"
        error={errors.source?.s3url}
        placeholder="s3://bucket-name/key"
      />
    ),
    url: (
      <FormField
        label="URL"
        register={register}
        name="source.url"
        error={errors.source?.url}
        placeholder="https://example.com"
      />
    ),
    username: (
      <FormField
        label="Username"
        register={register}
        name="source.username"
        error={errors.source?.username}
      />
    ),
    password: (
      <FormField
        label="Password"
        register={register}
        name="source.password"
        error={errors.source?.password}
        type="password"
      />
    ),
    inputNetworkLocationOnlyAWS: (
      <FormField
        label="Network Location"
        register={register}
        name="source.inputNetworkLocation"
        error={errors.source?.inputNetworkLocation}
        type="select"
        options={[{
          value: InputNetworkLocation.AWS,
          label: InputNetworkLocation.AWS
        }]}
      />
    ),
    inputSecurityGroups: (
      <FormField
        label="Security Groups"
        register={register}
        name="source.inputSecurityGroups"
        error={errors.source?.inputSecurityGroups}
      />
    ),
    streamName: (
      <FormField
        label="Stream Name"
        register={register}
        name="source.streamName"
        error={errors.source?.streamName}
        placeholder="my-stream"
      />
    ),
    roleArn: (
      <FormField
        label="Role ARN"
        register={register}
        name="source.roleArn"
        error={errors.source?.roleArn}
      />
    ),
    flowArn: (
      <FormField
        label="Flow ARN"
        register={register}
        name="source.flowArn"
        error={errors.source?.flowArn}
        placeholder="arn:aws:mediaconnect:region:account:flow:name:version"
      />
    ),
    streamId: (
      <FormField
        label="Stream ID"
        register={register}
        name="source.streamId"
        error={errors.source?.streamId}
      />
    ),
    srtListenerPort: (
      <FormField
        label="SRT Listener Port"
        register={register}
        name="source.srtListenerPort"
        error={errors.source?.srtListenerPort}
      />
    ),
    srtListenerAddress: (
      <FormField
        label="SRT Listener Address"
        register={register}
        name="source.srtListenerAddress"
        error={errors.source?.srtListenerAddress}
      />
    ),
    minimumLatency: (
      <FormField
        label="Minimum Latency"
        register={register}
        name="source.minimumLatency"
        error={errors.source?.minimumLatency}
        type="number"
      />
    ),
    srtDecryptionEnabled: (
      <FormField
        label="Enable SRT Decryption"
        type="checkbox"
        register={register}
        name="source.decryptionEnabled"
        error={errors.source?.decryptionEnabled}
      />
    ),
    decryptionAlgorithm: (
      <FormField
        label="Decryption Algorithm"
        register={register}
        name="source.decryption.Algorithm"
        error={errors.source?.decryption?.Algorithm}
        type="select"
        options={Object.values(SrtDecryptionAlgorithm).map(algo => ({
          value: algo,
          label: algo
        }))}
      />
    ),
    passphraseSecretArn: (
      <FormField
        label="Passphrase Secret ARN"
        register={register}
        name="source.decryption.passphraseSecretArn"
        error={errors.source?.decryption?.passphraseSecretArn}
      />
    ),
  };

  const renderSourceInputs = () => {
    switch (selectedInputType) {
      case InputType.MP4_FILE:
      case InputType.TS_FILE:
        return (
          <div className="space-y-2">
            {formFields.s3url}
          </div>
        );

      case InputType.URL_PULL:
        return (
          <div className="space-y-2">
            {formFields.url}
          </div>
        );

      case InputType.RTP_PUSH:
        return (
          <div className="space-y-2">
            {formFields.inputNetworkLocationOnlyAWS}
            {formFields.inputSecurityGroups}
          </div>
        );

      case InputType.RTMP_PUSH:
        return (
          <div className="space-y-2">
            {formFields.inputNetworkLocationOnlyAWS}
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
        switch (data.inputType) {
          case InputType.MP4_FILE:
          case InputType.TS_FILE:
            sourceData = data.source.s3url as S3Source;
            break;
          case InputType.URL_PULL:
            sourceData = data.source.url as Source;
            break;
          case InputType.SRT_CALLER:
            if (!data.source.decryptionEnabled) {
              data.source.decryption = undefined;
            }
            sourceData = data.source as Source;
            break;
          default:
            sourceData = data.source as Source;
        }
        
        onSubmit({
          name: data.name,
          description: data.description,
          inputType: selectedInputType,
          source: sourceData,
          onAirStartTime: data.onAirStartTime.toISOString(),
          onAirEndTime: data.onAirEndTime.toISOString(),
          inputType: InputType.MP4_FILE,
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
        <div className={'align-middle flex gap-2 my-2 items-center'}>
          <div className="flex items-center gap-2">
            <Videotape />
            <span>Input Type</span>
          </div>
          <select 
            className={`select select-bordered`}
            value={selectedInputType}
            onChange={(e) => {
              setSelectedInputType(e.target.value as keyof typeof InputType);
              setValue('inputType', e.target.value);
            }}
          >
            {Array.from(InputTypeDisplay.entries()).map(([type, display]) => (
              <option key={type} value={type}>
                {display}
              </option>
            ))}
          </select>
        </div>
        
        {renderSourceInputs()}
        
        <div className="label">
          <span className="label-text-alt text-error">
            {errors.source?.value?.message}
          </span>
        </div>
      </div>
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
