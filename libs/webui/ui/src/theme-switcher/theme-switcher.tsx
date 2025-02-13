import { useEffect } from 'react';
import { useDarkMode } from 'usehooks-ts';

export const THEME_KEYS = {
  DARK: 'night',
  LIGHT: 'light',
};

export function ThemeSwitcher() {
  const { isDarkMode, toggle } = useDarkMode();

  const handleToggle = () => {
    toggle();
  };

  useEffect(() => {
    const theme = isDarkMode ? THEME_KEYS.DARK : THEME_KEYS.LIGHT;
    document.documentElement.setAttribute('data-theme', theme);
  }, [isDarkMode]);

  return (
    <label className="flex cursor-pointer gap-2">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="15"
        height="15"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="5" />
        <path d="M12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4" />
      </svg>
      <input
        type="checkbox"
        value={THEME_KEYS.DARK}
        className="toggle toggle-xs"
        checked={isDarkMode}
        onChange={handleToggle}
      />
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="15"
        height="15"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
      </svg>
    </label>
  );
}

export default ThemeSwitcher;
