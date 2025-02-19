import { render } from '@testing-library/react';

import ListAssetView from './list-asset-view';

describe('ListAssetView', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<ListAssetView />);
    expect(baseElement).toBeTruthy();
  });
});
