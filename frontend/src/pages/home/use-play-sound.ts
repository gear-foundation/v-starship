import { useRef, useEffect } from 'react';

import { IS_SOUND_ENABLED } from './dev-config';
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
  GAME_CONFIG.SOUND_VICTORY,
  BOOSTER_CONFIG.soundActivate,
  BOSS_CONFIG.soundAppear,
  BOSS_CONFIG.soundExplosion,
  BOSS_CONFIG.soundRocket,
  BOSS_CONFIG.soundLaser,
];

function usePlaySound() {
  const audioContextRef = useRef<AudioContext | null>(null);
  const bufferCache = useRef<{ [key: string]: AudioBuffer }>({});

  useEffect(() => {
    if (!IS_SOUND_ENABLED) return;

    audioContextRef.current = new AudioContext();

    SOUNDS.forEach((src) => {
      fetch(src)
        .then((response) => response.arrayBuffer())
        .then((arrayBuffer) => {
          if (!audioContextRef.current) throw new Error('Audio context is not initialized');

          return audioContextRef.current.decodeAudioData(arrayBuffer, (buffer) => (bufferCache.current[src] = buffer));
        })
        .catch((error) => {
          console.error('Error loading sound', src, error);
        });
    });

    return () => {
      audioContextRef.current?.close().catch((error) => {
        console.error('Error closing audio context', error);
      });
    };
  }, []);

  return (src: string, volume = 0.5) => {
    if (!IS_SOUND_ENABLED) return;

    try {
      const ctx = audioContextRef.current;
      const buffer = bufferCache.current[src];

      if (!ctx) throw new Error('Audio context is not initialized');
      if (!buffer) throw new Error(`Audio buffer not loaded for source: ${src}`);

      const source = ctx.createBufferSource();
      source.buffer = buffer;

      const gainNode = ctx.createGain();
      gainNode.gain.value = volume;

      source.connect(gainNode).connect(ctx.destination);
      source.start(0);
    } catch (error) {
      console.error('Sound play error', src, error);
    }
  };
}

export { usePlaySound };
