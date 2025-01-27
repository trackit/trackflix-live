import { SingleAssetForm } from '@trackflix-live/forms';

export function SingleAssetFlow() {
  const onSubmit = (data: { assetUrl: string }) => {
    console.log(data);
  };

  return (
    <div>
      <SingleAssetForm onSubmit={onSubmit} />
    </div>
  );
}

export default SingleAssetFlow;
