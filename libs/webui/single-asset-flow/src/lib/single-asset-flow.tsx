import { SingleAssetForm } from '@trackflix-live/forms';
import { Panel } from '@trackflix-live/ui';

export function SingleAssetFlow() {
  const onSubmit = (data: { assetUrl: string }) => {
    console.log(data);
  };

  return (
    <Panel>
      <SingleAssetForm onSubmit={onSubmit} />
    </Panel>
  );
}

export default SingleAssetFlow;
