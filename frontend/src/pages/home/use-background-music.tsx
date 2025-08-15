import { useRef, useEffect } from 'react';

import { IS_SOUND_ENABLED } from './dev-config';
import { GAME_CONFIG } from './game-config';

function useBackgroundMusic(isEnabled: boolean) {
  const ref = useRef<HTMLAudioElement>(undefined);

  const pause = () => {
    if (!ref.current) return;

    ref.current.pause();
    ref.current.currentTime = 0;
  };

  useEffect(() => {
    if (!IS_SOUND_ENABLED || !isEnabled) return pause();
    if (ref.current) return;

    ref.current = new Audio(GAME_CONFIG.SOUND_BG_MUSIC);
    ref.current.loop = true;
    ref.current.volume = GAME_CONFIG.VOLUME_BG_MUSIC;

    ref.current.play().catch((error) => {
      console.error('Background music error:', error);
    });

    return () => {
      if (!ref.current) return;

      pause();
      ref.current = undefined;
    };
  }, [isEnabled]);
}

export { useBackgroundMusic };
