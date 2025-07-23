import { useAlert } from '@gear-js/react-hooks';
import { useRef, useEffect } from 'react';

import { getErrorMessage } from '@/utils';

import { GAME_CONFIG } from './game-config';

function useBackgroundMusic(isEnabled: boolean) {
  const alert = useAlert();
  const ref = useRef<HTMLAudioElement>(undefined);

  const pause = () => {
    if (!ref.current) return;

    ref.current.pause();
    ref.current.currentTime = 0;
  };

  useEffect(() => {
    if (!isEnabled) return pause();
    if (ref.current) return;

    ref.current = new Audio(GAME_CONFIG.SOUND_BG_MUSIC);
    ref.current.loop = true;
    ref.current.volume = GAME_CONFIG.VOLUME_BG_MUSIC;

    ref.current.play().catch((error) => {
      alert.error(`Failed to play background music: ${getErrorMessage(error)}`);
      console.error('Background music error:', error);
    });

    return () => {
      if (!ref.current) return;

      pause();
      ref.current = undefined;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEnabled]);
}

export { useBackgroundMusic };
