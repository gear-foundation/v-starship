import { useEffect, RefObject } from 'react';

const KEY = {
  LEFT: 'ArrowLeft',
  RIGHT: 'ArrowRight',
  UP: 'ArrowUp',
  DOWN: 'ArrowDown',
} as const;

const KEYS: string[] = Object.values(KEY);

function useKeyboardControls(inputIntensity: RefObject<{ x: number; y: number }>) {
  useEffect(() => {
    const setIntensity = (key: string, value: number) => {
      switch (key) {
        case KEY.LEFT:
          inputIntensity.current.x = -value;
          break;

        case KEY.RIGHT:
          inputIntensity.current.x = value;
          break;

        case KEY.UP:
          inputIntensity.current.y = value;
          break;

        case KEY.DOWN:
          inputIntensity.current.y = -value;
          break;
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (!KEYS.includes(e.key)) return;

      e.preventDefault();
      setIntensity(e.key, 1);
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (!KEYS.includes(e.key)) return;

      e.preventDefault();
      setIntensity(e.key, 0);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

export { useKeyboardControls };
