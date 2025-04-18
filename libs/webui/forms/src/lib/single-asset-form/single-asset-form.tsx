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
  [InputType.RTP_PUSH, 'RTP'],
  [InputType.RTMP_PUSH, 'RTMP (push)'],
  [InputType.RTMP_PULL, 'RTMP (pull)'],
  [InputType.URL_PULL, 'HLS'],
  [InputType.MEDIACONNECT, 'MediaConnect'],
  [InputType.MULTICAST, 'Multicast'],
  [InputType.AWS_CDI, 'AWS CDI'],
  [InputType.SRT_CALLER, 'SRT caller'],
]);

export const formSchema = z
  .object({
    name: z.string().min(1),
    description: z.string(),
    inputType: z.enum([...Object.values(InputType)] as [string, ...string[]]),
    source: 
      z.object({
        url: z.string()
          .optional()
          .refine(
            (val) => !val || /^s3:\/\/[a-z0-9][a-z0-9.-]*[a-z0-9](\/.*)?$/.test(val),
            { message: 'Must be a valid S3 URI (e.g., s3://bucket-name/key)' }
          ),
        username: z.string().optional(),
        password: z.string().optional(),
        streamName: z.string().optional(),
        inputNetworkLocation: z.enum([...Object.values(InputNetworkLocation)] as [string, ...string[]]).optional(),
        inputSecurityGroups: z.string().optional(),
        vpcSettings: z
          .object({
            subnetIds: z.string(),
            securityGroupId: z.string(),
          })
          .optional(),
        roleArn: z.string().optional(),
        flowArn: z.string().optional(),
        sourceIp: z.string().optional(),
        streamId: z.string().optional(),
        srtListenerPort: z.string().optional(),
        srtListenerAddress: z.string().optional(),
        minimumLatency: z.number().optional(),
        decryption: z.object({
          Algorithm: z.enum([...Object.values(SrtDecryptionAlgorithm)] as [string, ...string[]]),
          passphraseSecretArn: z.string().optional(),
        }).optional(),
        networkArn: z.string().optional(),
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
    url: (
      <FormField
        label="S3 Media URI"
        register={register}
        name="source.url"
        error={errors.source?.url}
        placeholder="s3://bucket-name/key"
      />
    ),
    inputNetworkLocation: (
      <FormField
        label="Network Location"
        register={register}
        name="source.inputNetworkLocation"
        error={errors.source?.inputNetworkLocation}
        type="select"
        options={Object.values(InputNetworkLocation).map(location => ({
          value: location,
          label: location
        }))}
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
    securityGroupId: (
      <FormField
        label="Security Group ID"
        register={register}
        name="source.vpcSettings.securityGroupId"
        error={errors.source?.vpcSettings?.securityGroupId}
      />
    ),
    subnetIds: (
      <FormField
        label="Subnet ID"
        register={register}
        name="source.vpcSettings.subnetIds"
        error={errors.source?.vpcSettings?.subnetIds}
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
    networkArn: (
      <FormField
        label="Network ARN"
        register={register}
        name="source.networkArn"
        error={errors.source?.networkArn}
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
    flowArn: (
      <FormField
        label="Flow ARN"
        register={register}
        name="source.flowArn"
        error={errors.source?.flowArn}
        placeholder="arn:aws:mediaconnect:region:account:flow:name:version"
      />
    ),
    sourceIp: (
      <FormField
        label="Source IP"
        register={register}
        name="source.sourceIp"
        error={errors.source?.sourceIp}
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
      case InputType.URL_PULL:
        return (
          <div className="space-y-2">
            {formFields.url}
          </div>
        );

      case InputType.RTP_PUSH:
        return (
          <div className="space-y-2">
            {formFields.inputNetworkLocation}
            {formFields.inputSecurityGroups}
            {formFields.securityGroupId}
            {formFields.subnetIds}
            {formFields.roleArn}
            {formFields.networkArn}
          </div>
        );

      case InputType.RTMP_PUSH:
        return (
          <div className="space-y-2">
            {formFields.inputNetworkLocation}
            {formFields.inputSecurityGroups}
            {formFields.securityGroupId}
            {formFields.subnetIds}
            {formFields.streamName}
            {formFields.roleArn}
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

      case InputType.MULTICAST:
        return (
          <div className="space-y-2">
            {formFields.url}
            {formFields.sourceIp}
          </div>
        );

      case InputType.AWS_CDI:
        return (
          <div className="space-y-2">
            {formFields.securityGroupId}
            {formFields.subnetIds}
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
            {formFields.decryptionAlgorithm}
            {formFields.passphraseSecretArn}
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
          case InputType.URL_PULL:
            sourceData = data.source.url as S3Source;
            break;
          default:
            sourceData = data.source as Source;
        }
        
        onSubmit({
          name: data.name,
          description: data.description,
          source: sourceData,
          inputType: selectedInputType,
          onAirStartTime: data.onAirStartTime.toISOString(),
          onAirEndTime: data.onAirEndTime.toISOString(),
          inputType: InputType.MP4_FILE,
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
