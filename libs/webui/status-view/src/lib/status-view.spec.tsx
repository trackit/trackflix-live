import { render } from '@testing-library/react';

import StatusView from './status-view';

describe('StatusView', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<StatusView />);
    expect(baseElement).toBeTruthy();
  });
});
