import { SingleAssetForm } from '@trackflix-live/forms';
import { postEvent } from '@trackflix-live/api-client';
import { Panel } from '@trackflix-live/ui';
import { useState } from 'react';
import { CreateEventRequest } from '@trackflix-live/types';
import { useNavigate } from 'react-router';

export function CreateEvent() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const onSubmit = async (data: CreateEventRequest['body']) => {
    try {
      setIsSubmitting(true);
      const res = await postEvent(data);
      navigate(`/status/${res.event.id}`);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div
      className={'flex justify-center items-center w-screen h-full relative'}
    >
      <div className={'w-full container max-w-[1000px]'}>
        <Panel>
          <div className="prose ">
            <h1>Create a new event</h1>
          </div>
          <hr className={'my-6'} />
          <SingleAssetForm onSubmit={onSubmit} disabled={isSubmitting} />
        </Panel>
      </div>
    </div>
  );
}

export default CreateEvent;
