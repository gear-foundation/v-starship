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
    const keysIntensity = { [KEY.LEFT]: 0, [KEY.RIGHT]: 0, [KEY.UP]: 0, [KEY.DOWN]: 0 };

    const updateIntensity = () => {
      inputIntensity.current.x = keysIntensity[KEY.RIGHT] - keysIntensity[KEY.LEFT];
      inputIntensity.current.y = keysIntensity[KEY.UP] - keysIntensity[KEY.DOWN];
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (!KEYS.includes(e.key)) return;

      e.preventDefault();
      keysIntensity[e.key as keyof typeof keysIntensity] = 1;
      updateIntensity();
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (!KEYS.includes(e.key)) return;

      e.preventDefault();
      keysIntensity[e.key as keyof typeof keysIntensity] = 0;
      updateIntensity();
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
