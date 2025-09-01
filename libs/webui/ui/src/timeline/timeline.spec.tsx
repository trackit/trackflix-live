import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import * as allure from 'allure-js-commons';

import Timeline from './timeline';

describe('Timeline', () => {
  it('should render successfully with basic steps', () => {
    allure.feature('Essential features');
    allure.story('UI components');
    allure.owner('Alexis le Dinh');
    allure.severity('normal');

    const steps = [{ text: 'Step 1' }, { text: 'Step 2' }, { text: 'Step 3' }];

    const { baseElement } = render(<Timeline steps={steps} />);
    expect(baseElement).toBeTruthy();

    // Verify all steps are rendered
    steps.forEach((step) => {
      expect(screen.getByText(step.text)).toBeInTheDocument();
    });
  });

  it('should render completed steps with primary color', () => {
    allure.feature('Essential features');
    allure.story('UI components');
    allure.owner('Alexis le Dinh');
    allure.severity('normal');

    const steps = [
      { text: 'Step 1', completed: true },
      { text: 'Step 2', completed: true },
      { text: 'Step 3' },
    ];

    render(<Timeline steps={steps} />);

    // Get all dividers (hr elements)
    const dividers = document.querySelectorAll('hr');

    // First two dividers should have primary color
    expect(dividers[0]).toHaveClass('bg-primary');
    expect(dividers[1]).toHaveClass('bg-primary');
  });

  it('should render loading spinner for steps in loading state', () => {
    allure.feature('Essential features');
    allure.story('UI components');
    allure.owner('Alexis le Dinh');
    allure.severity('normal');

    const steps = [
      { text: 'Step 1', completed: true },
      { text: 'Step 2', loading: true },
      { text: 'Step 3' },
    ];

    render(<Timeline steps={steps} />);

    // Check for loading spinner
    const spinner = document.querySelector('.loading');
    expect(spinner).toBeInTheDocument();
  });

  it('should render empty steps array', () => {
    allure.feature('Essential features');
    allure.story('UI components');
    allure.owner('Alexis le Dinh');
    allure.severity('normal');

    const steps: { text: string; completed?: boolean; loading?: boolean }[] =
      [];

    const { container } = render(<Timeline steps={steps} />);

    // Timeline should be empty but rendered
    const timelineItems = container.querySelectorAll('li');
    expect(timelineItems.length).toBe(0);
  });
});
