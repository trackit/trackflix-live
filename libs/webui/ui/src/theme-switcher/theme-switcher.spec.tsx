import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ThemeSwitcher, { THEME_KEYS } from './theme-switcher';
import { useDarkMode } from 'usehooks-ts';
import '@testing-library/jest-dom';

// Mock the entire usehooks-ts module
vi.mock('usehooks-ts', () => ({
  useDarkMode: vi.fn(),
}));

describe('ThemeSwitcher', () => {
  let mockToggle: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    // Reset the document's data-theme attribute before each test
    document.documentElement.removeAttribute('data-theme');
    mockToggle = vi.fn();

    // Mock matchMedia
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(), // deprecated
        removeListener: vi.fn(), // deprecated
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });

    // Setup default useDarkMode mock implementation
    vi.mocked(useDarkMode).mockImplementation(() => ({
      isDarkMode: false,
      toggle: mockToggle,
      enable: vi.fn(),
      disable: vi.fn(),
      set: vi.fn(),
    }));
  });

  it('should render successfully', () => {
    const { baseElement } = render(<ThemeSwitcher />);
    expect(baseElement).toBeTruthy();
  });

  it('should render toggle checkbox and icons', () => {
    render(<ThemeSwitcher />);

    expect(screen.getByRole('checkbox')).toBeTruthy();
    expect(screen.getByRole('checkbox')).toHaveAttribute(
      'value',
      THEME_KEYS.DARK
    );
    // Check for both sun and moon icons
    const svgs = document.querySelectorAll('svg');
    expect(svgs).toHaveLength(2);
  });

  it('should toggle theme when checkbox is clicked', () => {
    render(<ThemeSwitcher />);

    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);

    expect(mockToggle).toHaveBeenCalledTimes(1);
  });

  it('should set light theme attribute when isDarkMode is false', () => {
    render(<ThemeSwitcher />);

    expect(document.documentElement.getAttribute('data-theme')).toBe(
      THEME_KEYS.LIGHT
    );
  });

  it('should set dark theme attribute when isDarkMode is true', () => {
    vi.mocked(useDarkMode).mockImplementation(() => ({
      isDarkMode: true,
      toggle: mockToggle,
      enable: vi.fn(),
      disable: vi.fn(),
      set: vi.fn(),
    }));

    render(<ThemeSwitcher />);

    expect(document.documentElement.getAttribute('data-theme')).toBe(
      THEME_KEYS.DARK
    );
  });

  it('should update checkbox state based on isDarkMode', () => {
    vi.mocked(useDarkMode).mockImplementation(() => ({
      isDarkMode: true,
      toggle: vi.fn(),
      enable: vi.fn(),
      disable: vi.fn(),
      set: vi.fn(),
    }));

    render(<ThemeSwitcher />);

    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeChecked();
  });
});
