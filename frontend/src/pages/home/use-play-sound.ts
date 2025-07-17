import { useAlert } from '@gear-js/react-hooks';
import { useRef, useEffect } from 'react';

import { GAME_CONFIG, BOSS_CONFIG, BOOSTER_CONFIG } from './game-config';

const SOUNDS = [
  GAME_CONFIG.SOUND_PLAYER_LASER,
  GAME_CONFIG.SOUND_PLAYER_ROCKET,
  GAME_CONFIG.SOUND_ENEMY_EXPLOSION,
  GAME_CONFIG.SOUND_PLAYER_EXPLOSION,
  GAME_CONFIG.SOUND_ENEMY_HIT,
  GAME_CONFIG.SOUND_PLAYER_HIT,
  GAME_CONFIG.SOUND_ASTEROID_EXPLOSION,
  GAME_CONFIG.SOUND_MINE_EXPLOSION,
  GAME_CONFIG.SOUND_ENEMY_LASER,
  BOOSTER_CONFIG.soundActivate,
  BOSS_CONFIG.soundAppear,
  BOSS_CONFIG.soundExplosion,
  BOSS_CONFIG.soundRocket,
  BOSS_CONFIG.soundLaser,
];

function usePlaySound() {
  const alert = useAlert();
  const audioCache = useRef<{ [key: string]: HTMLAudioElement[] }>({});

  useEffect(() => {
    SOUNDS.forEach((src) => {
      audioCache.current[src] = [];

      for (let i = 0; i < 2; i++) {
        const audio = new Audio(src);
        audio.preload = 'auto';
        audioCache.current[src].push(audio);
      }
    });

    return () => {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      Object.values(audioCache.current).forEach((audioArray) => {
        audioArray.forEach((audio) => {
          audio.pause();
          audio.src = '';
        });
      });
    };
  }, []);

  return (src: string, volume = 0.5) => {
    try {
      const audioArray = audioCache.current[src];
      if (!audioArray || audioArray.length === 0) throw new Error('Not found');

      const audio = audioArray.find((a) => a.paused || a.ended) || audioArray[0];

      audio.currentTime = 0;
      audio.volume = volume;

      void audio.play();
    } catch (error) {
      console.error('Sound play error', src, error);
      alert.error('Failed to play sound');
    }
  };
}

export { usePlaySound };
