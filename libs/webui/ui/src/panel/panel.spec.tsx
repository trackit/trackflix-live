import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

import Panel from './panel';
import * as allure from 'allure-js-commons';

describe('Panel', () => {
  it('should render successfully', () => {
    allure.feature('Essential features');
    allure.story('UI components');
    allure.owner('Alexis le Dinh');
    allure.severity('normal');

    const { baseElement } = render(<Panel>test</Panel>);
    expect(baseElement).toBeTruthy();
  });

  it('should render with custom className', () => {
    allure.feature('Essential features');
    allure.story('UI components');
    allure.owner('Alexis le Dinh');
    allure.severity('normal');

    const { container } = render(<Panel className="custom-class">test</Panel>);
    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('should render children content', () => {
    allure.feature('Essential features');
    allure.story('UI components');
    allure.owner('Alexis le Dinh');
    allure.severity('normal');

    render(
      <Panel>
        <div>Test Content</div>
      </Panel>
    );
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('should combine default and custom classes', () => {
    allure.feature('Essential features');
    allure.story('UI components');
    allure.owner('Alexis le Dinh');
    allure.severity('normal');

    const { container } = render(<Panel className="custom-class">test</Panel>);
    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('should handle multiple children', () => {
    allure.feature('Essential features');
    allure.story('UI components');
    allure.owner('Alexis le Dinh');
    allure.severity('normal');

    render(
      <Panel>
        <div>First Child</div>
        <span>Second Child</span>
        <p>Third Child</p>
      </Panel>
    );
    expect(screen.getByText('First Child')).toBeInTheDocument();
    expect(screen.getByText('Second Child')).toBeInTheDocument();
    expect(screen.getByText('Third Child')).toBeInTheDocument();
  });
});
