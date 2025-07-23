import { useRef, useState } from 'react';

import { GAME_CONFIG } from './game-config';

const UPDATE_INTERVAL_MS = 1000;

function useGameTime() {
  const [gameTime, setGameTime] = useState(GAME_CONFIG.GAME_DURATION_MS);
  const gameTimeRef = useRef(gameTime);

  const lastTimeRef = useRef(performance.now());

  const updateGameTime = (currentTime: number) => {
    if (currentTime - lastTimeRef.current < UPDATE_INTERVAL_MS) return;

    setGameTime((prevValue) => {
      const value = prevValue > 0 ? prevValue - 1000 : 0;
      gameTimeRef.current = value;

      return value;
    });

    lastTimeRef.current = currentTime;
  };

  return { gameTime, gameTimeRef, updateGameTime };
}

export { useGameTime };
