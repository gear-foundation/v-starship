import { useRef, useState } from 'react';

import { GAME_CONFIG } from './game-config';

const UPDATE_INTERVAL_MS = 1000;

function useGameTime() {
  const [gameTime, setGameTime] = useState(5);
  const lastTimeRef = useRef(performance.now());

  const updateGameTime = (currentTime: number) => {
    if (currentTime - lastTimeRef.current < UPDATE_INTERVAL_MS) return;

    setGameTime((prevGameTime: number) => (prevGameTime > 0 ? prevGameTime - 1 : 0));

    lastTimeRef.current = currentTime;
  };

  return { gameTime, updateGameTime };
}

export { useGameTime };
