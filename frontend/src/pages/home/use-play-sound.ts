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
  const audioContextRef = useRef<AudioContext | null>(null);
  const bufferCache = useRef<{ [key: string]: AudioBuffer | null }>({});

  useEffect(() => {
    audioContextRef.current = new AudioContext();

    SOUNDS.forEach((src) => {
      fetch(src)
        .then((response) => response.arrayBuffer())
        .then((arrayBuffer) =>
          audioContextRef.current!.decodeAudioData(arrayBuffer, (buffer) => {
            bufferCache.current[src] = buffer;
          }),
        )
        .catch(() => {
          bufferCache.current[src] = null;
        });
    });

    return () => {
      audioContextRef.current?.close().catch((error) => {
        console.error('Error closing audio context', error);
        alert.error('Failed to close audio context');
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (src: string, volume = 0.5) => {
    try {
      const ctx = audioContextRef.current;
      const buffer = bufferCache.current[src];
      if (!ctx || !buffer) throw new Error('Audio buffer not loaded');

      const source = ctx.createBufferSource();
      source.buffer = buffer;

      const gainNode = ctx.createGain();
      gainNode.gain.value = volume;

      source.connect(gainNode).connect(ctx.destination);
      source.start(0);
    } catch (error) {
      console.error('Sound play error', src, error);
      alert.error('Failed to play sound');
    }
  };
}

export { usePlaySound };
