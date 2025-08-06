const IS_FPS_COUNTER_ENABLED = (import.meta.env.VITE_ENABLE_FPS_COUNTER as string | undefined) === 'true';
const IS_DEV_MODE_ENABLED = (import.meta.env.VITE_ENABLE_DEV_MODE as string | undefined) === 'true';
const IS_SOUND_ENABLED = (import.meta.env.VITE_ENABLE_SOUND as string | undefined) !== 'false'; // reversed logic to be enabled by default
const IS_PLAYER_IMMORTAL = (import.meta.env.VITE_ENABLE_PLAYER_IMMORTALITY as string | undefined) === 'true';

export { IS_FPS_COUNTER_ENABLED, IS_DEV_MODE_ENABLED, IS_SOUND_ENABLED, IS_PLAYER_IMMORTAL };
