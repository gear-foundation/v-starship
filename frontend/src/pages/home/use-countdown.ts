import { useEffect, useState } from 'react';

const COUNTDOWN_INTERVAL_MS = 1000;

function useCountdown(initialMilliseconds: number) {
  const [millisecondsLeft, setMillisecondsLeft] = useState(initialMilliseconds);

  useEffect(() => {
    setMillisecondsLeft(initialMilliseconds);

    if (initialMilliseconds <= 0) return;

    const intervalId = setInterval(() => {
      setMillisecondsLeft((prev) => {
        if (prev <= COUNTDOWN_INTERVAL_MS) {
          clearInterval(intervalId);
          return 0;
        }

        return prev - COUNTDOWN_INTERVAL_MS;
      });
    }, COUNTDOWN_INTERVAL_MS);

    return () => clearInterval(intervalId);
  }, [initialMilliseconds]);

  return millisecondsLeft;
}

export { useCountdown };
