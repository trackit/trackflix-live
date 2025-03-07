import { render } from '@testing-library/react';

import StatusBadge from './status-badge';

describe('StatusBadge', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<StatusBadge status="PRE-TX" />);
    expect(baseElement).toBeTruthy();
  });
});
