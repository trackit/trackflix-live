import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import CopyText from './copy-text';
import '@testing-library/jest-dom';
import * as allure from 'allure-js-commons';

describe('CopyText', () => {
  beforeEach(() => {
    // Mock clipboard API
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn(),
      },
    });
    // Mock setTimeout
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.clearAllTimers();
  });

  it('renders text content', () => {
    allure.feature('Essential features');
    allure.story('UI components');
    allure.owner('Alexis le Dinh');
    allure.severity('normal');

    render(<CopyText text="Test content" />);
    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  it('shows copy button by default', () => {
    allure.feature('Essential features');
    allure.story('UI components');
    allure.owner('Alexis le Dinh');
    allure.severity('normal');

    render(<CopyText text="Test content" />);
    expect(screen.getByText('Copy')).toBeInTheDocument();
  });

  it('changes button text and icon when clicked', async () => {
    allure.feature('Essential features');
    allure.story('UI components');
    allure.owner('Alexis le Dinh');
    allure.severity('normal');

    render(<CopyText text="Test content" />);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(screen.getByText('Copied to clipboard')).toBeInTheDocument();
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('Test content');
  });
});
