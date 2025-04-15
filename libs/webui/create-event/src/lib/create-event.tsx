import { SingleAssetForm } from '@trackflix-live/forms';
import { postEvent } from '@trackflix-live/api-client';
import { Panel } from '@trackflix-live/ui';
import { useState } from 'react';
import { CreateEventRequest } from '@trackflix-live/types';
import { useNavigate } from 'react-router';
import { useUserStore } from '@trackflix-live/webui-stores';

export function CreateEvent() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { isCreator } = useUserStore();
  const onSubmit = async (data: CreateEventRequest['body']) => {
    try {
      setIsSubmitting(true);
      const res = await postEvent(data);
      navigate(`/status/${res.event.id}`);
    } catch (err) {
      setIsSubmitting(false);
      console.error(err);
    }
  };

  if (!isCreator) {
    return (
      <div
        className={
          'flex justify-center  w-screen h-full relative md:p-8 md:pt-16 p-2 pt-8'
        }
      ></div>
    );
  }

  return (
    <div
      className={
        'flex justify-center  w-screen h-full relative md:p-8 md:pt-16 p-2 pt-8'
      }
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
