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
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!KEYS.includes(e.key)) return;

      e.preventDefault();

      switch (e.key) {
        case KEY.LEFT:
          inputIntensity.current.x = -1;
          break;
        case KEY.RIGHT:
          inputIntensity.current.x = 1;
          break;
        case KEY.UP:
          inputIntensity.current.y = 1;
          break;
        case KEY.DOWN:
          inputIntensity.current.y = -1;
          break;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (!KEYS.includes(e.key)) return;

      e.preventDefault();

      // only reset if the released key matches current direction
      switch (e.key) {
        case KEY.LEFT:
          if (inputIntensity.current.x < 0) inputIntensity.current.x = 0;
          break;
        case KEY.RIGHT:
          if (inputIntensity.current.x > 0) inputIntensity.current.x = 0;
          break;
        case KEY.UP:
          if (inputIntensity.current.y > 0) inputIntensity.current.y = 0;
          break;
        case KEY.DOWN:
          if (inputIntensity.current.y < 0) inputIntensity.current.y = 0;
          break;
      }
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
