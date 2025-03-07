import { render } from '@testing-library/react';

import PageTitle from './page-title';

describe('PageTitle', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<PageTitle title={'Test'} />);
    expect(baseElement).toBeTruthy();
  });
});
