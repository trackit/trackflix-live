import { render, screen } from '@testing-library/react';
import { describe, it, beforeEach, afterEach, expect, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';

import Clock from './clock';
import * as allure from 'allure-js-commons';

describe('Clock', () => {
  beforeEach(() => {
    // Mock the Date object to have a consistent time for testing
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-01-01T12:00:00'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should render successfully', () => {
    allure.feature('Essential features');
    allure.story('UI components');
    allure.owner('Alexis le Dinh');
    allure.severity('normal');

    const { baseElement } = render(<Clock />);
    expect(baseElement).toBeTruthy();
  });

  it('should display the current time in correct format', () => {
    allure.feature('Essential features');
    allure.story('UI components');
    allure.owner('Alexis le Dinh');
    allure.severity('normal');

    render(<Clock />);
    expect(screen.getByText('12:00:00 PM')).toBeInTheDocument();
  });

  it('should cleanup interval on unmount', () => {
    allure.feature('Essential features');
    allure.story('UI components');
    allure.owner('Alexis le Dinh');
    allure.severity('normal');

    const clearIntervalSpy = vi.spyOn(window, 'clearInterval');
    const { unmount } = render(<Clock />);

    unmount();
    expect(clearIntervalSpy).toHaveBeenCalled();
  });
});
