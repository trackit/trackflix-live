import { SingleAssetForm } from '@trackflix-live/forms';
import { postEvent } from '@trackflix-live/api-client';
import { useState } from 'react';

export function SingleAssetFlow() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (data: {
    name: string;
    description: string;
    s3Bucket: string;
    s3Key: string;
    onAirStartTime: Date;
    onAirEndTime: Date;
  }) => {
    try {
      setIsSubmitting(true);
      await postEvent(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <div className="prose ">
        <h1>Create a new event</h1>
      </div>
      <hr className={'my-6'} />
      <SingleAssetForm onSubmit={onSubmit} disabled={isSubmitting} />
    </div>
  );
}

export default SingleAssetFlow;
