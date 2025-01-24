import { render } from '@testing-library/react';

import SingleAssetFlow from './single-asset-flow';

describe('SingleAssetFlow', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<SingleAssetFlow />);
    expect(baseElement).toBeTruthy();
  });
});
