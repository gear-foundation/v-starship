import { useState, useRef } from 'react';

const UPDATE_INTERVAL_MS = 1000;

function useFps() {
  const [fps, setFps] = useState(0);

  const frameCountRef = useRef(0);
  const lastTimeRef = useRef(performance.now());

  const updateFps = (currentTime: number) => {
    frameCountRef.current++;

    if (currentTime - lastTimeRef.current < UPDATE_INTERVAL_MS) return;

    setFps(frameCountRef.current);

    frameCountRef.current = 0;
    lastTimeRef.current = currentTime;
  };

  return { fps, updateFps };
}

export { useFps };
