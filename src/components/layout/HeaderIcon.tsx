import { useTheme } from '@/components/theme-provider';

export function HeaderIcon() {
  const { theme } = useTheme();

  // Determine logo styling based on theme
  const getLogoClasses = () => {
    switch (theme) {
      case 'light':
        return 'h-8 w-8 filter brightness-0'; // Black logo on light background
      case 'dark':
        return 'h-8 w-8 filter brightness-0 invert'; // White logo on dark background
      case 'nautical':
        return 'h-8 w-8 filter brightness-0 invert'; // White logo on nautical background
      case 'system':
        // For system theme, we'll use CSS classes that respond to system preference
        return 'h-8 w-8 filter brightness-0 dark:invert';
      default:
        return 'h-8 w-8 filter brightness-0 invert';
    }
  };

  return (
    <div className="w-16 flex items-center justify-center border-r border-border">
      <img
        src="/assets/logos/neptune.svg"
        alt="Neptune"
        className={getLogoClasses()}
      />
    </div>
  );
}
