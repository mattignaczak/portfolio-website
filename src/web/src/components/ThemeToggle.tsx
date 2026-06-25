import { useEffect, useState } from 'react';
import { Moon, Sun } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';

function isDarkInitially(): boolean {
  if (typeof document === 'undefined') return false;
  return document.documentElement.classList.contains('dark');
}

export function ThemeToggle() {
  const [dark, setDark] = useState(isDarkInitially);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('theme', dark ? 'dark' : 'light');
  }, [dark]);

  return (
    <Button
      variant="neutral"
      size="icon"
      aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      onClick={() => setDark((d) => !d)}
    >
      {dark ? <Sun weight="bold" /> : <Moon weight="bold" />}
    </Button>
  );
}
