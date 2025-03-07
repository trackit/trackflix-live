import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

import Panel from './panel';

describe('Panel', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<Panel>test</Panel>);
    expect(baseElement).toBeTruthy();
  });

  it('should render with custom className', () => {
    const { container } = render(<Panel className="custom-class">test</Panel>);
    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('should render children content', () => {
    render(
      <Panel>
        <div>Test Content</div>
      </Panel>
    );
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('should combine default and custom classes', () => {
    const { container } = render(<Panel className="custom-class">test</Panel>);
    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('should handle multiple children', () => {
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
