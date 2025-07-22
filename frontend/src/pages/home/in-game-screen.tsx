/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Account } from '@gear-js/react-hooks';
import { Heart, Zap } from 'lucide-react';
import React, { useState, useEffect, useRef } from 'react';

import { Button } from '@/components/ui/button';

import { GAME_CONFIG, BOSS_CONFIG } from './game-config';
import { MobileControls } from './mobile-controls';
import { ResultsScreen } from './results-screen';
import { SpaceBackground } from './space-background';
import { useFps } from './use-fps';
import { useGameTime } from './use-game-time';
import { usePlaySound } from './use-play-sound';

interface GameObject {
  id: string;
  x: number;
  y: number;
  rotation?: number;
  speed?: number;
  phase?: number;
  rotationSpeed?: number;
  x0?: number;
  y0?: number;
  ampX?: number;
  phaseX?: number;
  ampY?: number;
  phaseY?: number;
  born?: number;
  size?: number;
}

interface InGameScreenProps {
  onBackToMenu: () => void;
  onReplayGame: () => void;
  playerPTS: number;
  gamesAvailable: number;
  shipLevel: number;
  boosterCount: number;
  account: Account | undefined;
  integerBalanceDisplay: {
    value?: string;
    unit?: string;
  };
}

// === ПАРАМЕТРЫ СКОРОСТИ ===
const MINE_SPEED = GAME_CONFIG.MINE_SPEED;

// === КОНСТАНТЫ РАЗМЕРОВ И СКОРОСТЕЙ ===
const PLAYER_SHIP_BASE_SIZE = GAME_CONFIG.PLAYER_SHIP_BASE_SIZE;
const PLAYER_SHIP_SIZE_STEP = GAME_CONFIG.PLAYER_SHIP_SIZE_STEP;
const ENEMY_SIZE = GAME_CONFIG.ENEMY_SIZE;
const ASTEROID_SIZE_MIN = GAME_CONFIG.ASTEROID_SIZE_MIN;
const ASTEROID_SIZE_MAX = GAME_CONFIG.ASTEROID_SIZE_MAX;
const MINE_SIZE = GAME_CONFIG.MINE_SIZE;
const PLAYER_LASER_WIDTH = GAME_CONFIG.PLAYER_LASER_WIDTH;
const PLAYER_LASER_HEIGHT = GAME_CONFIG.PLAYER_LASER_HEIGHT;
const PLAYER_ROCKET_WIDTH = GAME_CONFIG.PLAYER_ROCKET_WIDTH;
const PLAYER_ROCKET_HEIGHT = GAME_CONFIG.PLAYER_ROCKET_HEIGHT;
const ENEMY_LASER_WIDTH = GAME_CONFIG.ENEMY_LASER_WIDTH;
const ENEMY_LASER_HEIGHT = GAME_CONFIG.ENEMY_LASER_HEIGHT;

const ASTEROID_SPEED_MIN = GAME_CONFIG.ASTEROID_SPEED_MIN;
const ASTEROID_SPEED_MAX = GAME_CONFIG.ASTEROID_SPEED_MAX;

// === КОНФИГ ДЛЯ БУСТЕРОВ ===
const BOOSTER_CONFIG = GAME_CONFIG.BOOSTER_CONFIG;

const getBoosterSpawnTimings = () => {
  const duration = GAME_CONFIG.GAME_DURATION;
  const minT = duration * 0.1;
  const maxT = duration * 0.9;
  const arr: number[] = [];

  for (let i = 0; i < BOOSTER_CONFIG.countPerGame; ++i) {
    arr.push(minT + Math.random() * (maxT - minT));
  }

  return arr.sort((a, b) => a - b);
};

export default function InGameScreen({
  onBackToMenu,
  onReplayGame,
  playerPTS,
  gamesAvailable,
  shipLevel,
  boosterCount,
  account,
  integerBalanceDisplay,
}: InGameScreenProps) {
  // === ВСЕ ХУКИ ДОЛЖНЫ БЫТЬ НА ВЕРХНЕМ УРОВНЕ ===
  // Основное состояние игры
  const [playerHP, setPlayerHP] = useState(GAME_CONFIG.INITIAL_PLAYER_HP);
  const [playerX] = useState(50);
  const [playerY] = useState(10);
  const [showResults, setShowResults] = useState(false);
  const [isVictory, setIsVictory] = useState(true);
  const [playerVARA] = useState(500);
  const [ptsEarned, setPtsEarned] = useState(0);
  const [playerExists, setPlayerExists] = useState(true);

  // === СОСТОЯНИЕ ДЛЯ БОССА ===
  // Keep legacy state for compatibility with other systems that still rely on them
  const [boss, setBoss] = useState<any>({
    id: 'boss',
    x: (BOSS_CONFIG.trajectory.X_MIN + BOSS_CONFIG.trajectory.X_MAX) / 2,
    y: BOSS_CONFIG.trajectory.Y_APPEAR, // старт вне поля
    speed: BOSS_CONFIG.speed,
    x0: (BOSS_CONFIG.trajectory.X_MIN + BOSS_CONFIG.trajectory.X_MAX) / 2,
    y0: BOSS_CONFIG.trajectory.Y_TARGET, // рабочая позиция по Y
    ampX: BOSS_CONFIG.trajectory.AMP_X,
    phaseX: BOSS_CONFIG.trajectory.PHASE_X,
    ampY: BOSS_CONFIG.trajectory.AMP_Y,
    phaseY: BOSS_CONFIG.trajectory.PHASE_Y,
    born: Date.now(),
  });
  const [bossHP, setBossHP] = useState(0);
  const [bossExists, setBossExists] = useState(false);
  const [bossPhase, setBossPhase] = useState<'idle' | 'active' | 'exploding' | 'defeated' | 'appearing'>('idle');
  const bossRef = useRef(boss);
  const bossHPRef = useRef(bossHP);
  const bossExistsRef = useRef(bossExists);
  const bossPhaseRef = useRef(bossPhase);
  useEffect(() => {
    bossRef.current = boss;
  }, [boss]);
  useEffect(() => {
    bossHPRef.current = bossHP;
  }, [bossHP]);
  useEffect(() => {
    bossExistsRef.current = bossExists;
  }, [bossExists]);
  useEffect(() => {
    bossPhaseRef.current = bossPhase;
  }, [bossPhase]);

  // Враги, астероиды, мины
  const [enemies] = useState<GameObject[]>([]);

  // Снаряды
  const [playerLasers] = useState<any[]>([]);
  const [playerRockets] = useState<any[]>([]);
  const [enemyLasers] = useState<any[]>([]);

  // HP
  const [enemyHP, setEnemyHP] = useState<{ [id: string]: number }>({});
  const [asteroidHP, setAsteroidHP] = useState<{ [id: string]: number }>({});
  const [mineHP, setMineHP] = useState<{ [id: string]: number }>({});

  // Ограничения движения
  const X_MIN = 0;
  const X_MAX = 100;
  const Y_MIN = 5;
  const Y_MAX = 60;

  // Рефы для координат игрока
  const playerXRef = useRef(playerX);
  const playerYRef = useRef(playerY);
  useEffect(() => {
    playerXRef.current = playerX;
  }, [playerX]);
  useEffect(() => {
    playerYRef.current = playerY;
  }, [playerY]);

  // Управление игроком
  const pressedKeys = useRef<{ [key: string]: boolean }>({});

  // Trackpad input intensities (0-1, where 1 is maximum intensity)
  const trackpadIntensity = useRef<{ [key: string]: number }>({});

  const PLAYER_MOVE = {
    accelX: GAME_CONFIG.PLAYER_ACCEL_X,
    accelY: GAME_CONFIG.PLAYER_ACCEL_Y,
    maxSpeedX: GAME_CONFIG.PLAYER_MAX_SPEED_X,
    maxSpeedY: GAME_CONFIG.PLAYER_MAX_SPEED_Y,
    frictionX: GAME_CONFIG.PLAYER_FRICTION_X,
    frictionY: GAME_CONFIG.PLAYER_FRICTION_Y,
  };
  const [playerVX, setPlayerVX] = useState(0);
  const [playerVY, setPlayerVY] = useState(0);

  const playerVXRef = useRef(playerVX);
  const playerVYRef = useRef(playerVY);
  useEffect(() => {
    playerVXRef.current = playerVX;
  }, [playerVX]);
  useEffect(() => {
    playerVYRef.current = playerVY;
  }, [playerVY]);

  // Рефы для актуальных данных
  const enemiesRef = useRef(enemies);

  const playerLasersRef = useRef(playerLasers);
  const playerRocketsRef = useRef(playerRockets);
  const enemyLasersRef = useRef(enemyLasers);
  const enemyHPRef = useRef(enemyHP);
  const asteroidHPRef = useRef(asteroidHP);
  const mineHPRef = useRef(mineHP);
  const playerHPRef = useRef(playerHP);
  useEffect(() => {
    enemiesRef.current = enemies;
  }, [enemies]);
  useEffect(() => {
    playerLasersRef.current = playerLasers;
  }, [playerLasers]);
  useEffect(() => {
    playerRocketsRef.current = playerRockets;
  }, [playerRockets]);
  useEffect(() => {
    enemyLasersRef.current = enemyLasers;
  }, [enemyLasers]);
  useEffect(() => {
    enemyHPRef.current = enemyHP;
  }, [enemyHP]);
  useEffect(() => {
    asteroidHPRef.current = asteroidHP;
  }, [asteroidHP]);
  useEffect(() => {
    mineHPRef.current = mineHP;
  }, [mineHP]);
  useEffect(() => {
    playerHPRef.current = playerHP;
  }, [playerHP]);

  // Взрывы
  interface Explosion {
    id: string;
    x: number;
    y: number;
    type: 'enemy' | 'asteroid' | 'mine' | 'player' | 'boss';
    created: number;
  }

  // Explosions ref-based system
  const explosionsDataRef = useRef<Explosion[]>([]);

  // Частицы взрыва
  interface ExplosionParticle {
    id: string;
    x: number; // %
    y: number; // %
    vx: number; // %/frame
    vy: number;
    color: string;
    size: number;
    life: number; // ms
    created: number;
    type: 'enemy' | 'asteroid' | 'mine' | 'player' | 'boss';
  }

  // Particles ref-based system
  const particlesDataRef = useRef<ExplosionParticle[]>([]);

  // Мультипликатор скорости стрельбы
  const [fireRateMultiplier, setFireRateMultiplier] = useState(1);
  const fireRateMultiplierRef = useRef(fireRateMultiplier);
  useEffect(() => {
    fireRateMultiplierRef.current = fireRateMultiplier;
  }, [fireRateMultiplier]);

  // Бустеры: теперь с полем appearAt и isActive
  const activatedBoostersCount = useRef(0);

  const [activeBooster, setActiveBooster] = useState(false);
  const activeBoosterRef = useRef(activeBooster);
  useEffect(() => {
    activeBoosterRef.current = activeBooster;
  }, [activeBooster]);

  const boosterTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // === ЗВУКИ ===
  const playSound = usePlaySound();

  // Фоновая музыка и звуки событий
  const bgMusicRef = useRef<HTMLAudioElement | null>(null);

  /**
   * Централизованные уровни громкости для всех игровых звуков.
   * Можно легко настраивать для каждого события.
   */
  const soundVolumes = {
    bgMusic: GAME_CONFIG.VOLUME_BG_MUSIC,
    playerLaser: GAME_CONFIG.VOLUME_PLAYER_LASER,
    playerRocket: GAME_CONFIG.VOLUME_PLAYER_ROCKET,
    enemyLaser: GAME_CONFIG.VOLUME_ENEMY_LASER,
    playerExplosion: GAME_CONFIG.VOLUME_PLAYER_EXPLOSION,
    enemyExplosion: GAME_CONFIG.VOLUME_ENEMY_EXPLOSION,
    asteroidExplosion: GAME_CONFIG.VOLUME_ASTEROID_EXPLOSION,
    mineExplosion: GAME_CONFIG.VOLUME_MINE_EXPLOSION,
    hitOnPlayer: GAME_CONFIG.VOLUME_PLAYER_HIT,
    hitOnEnemy: GAME_CONFIG.VOLUME_ENEMY_HIT,
    boosterActivate: GAME_CONFIG.VOLUME_BOOSTER_ACTIVATE,
  };

  // Фоновая музыка — запускается при старте игры, останавливается при завершении
  useEffect(() => {
    if (showResults) {
      if (bgMusicRef.current) {
        bgMusicRef.current.pause();
        bgMusicRef.current.currentTime = 0;
      }
      return;
    }

    if (!bgMusicRef.current) {
      bgMusicRef.current = new Audio(GAME_CONFIG.SOUND_BG_MUSIC);
      bgMusicRef.current.loop = true;
      bgMusicRef.current.volume = soundVolumes.bgMusic;
      bgMusicRef.current.play().catch(() => {});
    }

    return () => {
      if (bgMusicRef.current) {
        bgMusicRef.current.pause();
        bgMusicRef.current.currentTime = 0;
        bgMusicRef.current = null;
      }
    };
  }, [showResults, soundVolumes.bgMusic]);

  // Вспомогательная функция для генерации частиц
  function spawnExplosionParticles(x: number, y: number, type: 'enemy' | 'asteroid' | 'mine' | 'player' | 'boss') {
    let count = 16,
      colors: string[] = [],
      size = 3,
      speed = 0.7,
      life = 600;
    if (type === 'mine') {
      count = 14 + Math.floor(Math.random() * 4);
      colors = ['#ff9800', '#ffb300', '#ff5722', '#fff176'];
      size = 3;
      speed = 0.7;
    } else if (type === 'asteroid') {
      count = 16 + Math.floor(Math.random() * 4);
      colors = ['#fff', '#e0e0e0', '#bdbdbd', '#757575'];
      size = 3;
      speed = 0.4;
    } else if (type === 'enemy') {
      count = 16 + Math.random() * 4;
      colors = ['#39ff14', '#baffc9', '#00ff99', '#00ffc3'];
      size = 3;
      speed = 0.7;
    } else if (type === 'player') {
      count = 48 + Math.floor(Math.random() * 8);
      colors = ['#fff200', '#ff9800', '#ff3d00', '#fff', '#ffd600'];
      size = 4;
      speed = 1.0;
      life = 1700;
    } else if (type === 'boss') {
      count = 48 + Math.floor(Math.random() * 8);
      colors = ['#ff1744', '#ffea00', '#00e5ff', '#fff', '#ff9100', '#00ffea', '#ff4081'];
      size = 1;
      speed = 1.0;
      life = 1500;
    }
    const now = Date.now();
    const particles: ExplosionParticle[] = [];
    for (let i = 0; i < count; i++) {
      const angle = (2 * Math.PI * i) / count + Math.random() * ((Math.PI * 2) / count);
      const v = speed * (0.7 + Math.random() * 0.7);
      particles.push({
        id: `${type}_part_${Math.random().toString(36).slice(2)}`,
        x,
        y,
        vx: Math.cos(angle) * v,
        vy: Math.sin(angle) * v,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: size + Math.random() * (type === 'boss' ? 10 : type === 'player' ? 3 : 2),
        life,
        created: now,
        type,
      });
    }

    particlesDataRef.current.push(...particles);
  }

  // Вспомогательная функция для взрыва и звука
  function spawnExplosion(x: number, y: number, type: 'enemy' | 'asteroid' | 'mine' | 'player' | 'boss') {
    // Корректируем позицию взрыва для визуального центра объекта
    const cx = x;
    let cy = y;
    if (type === 'enemy') cy = y + 2.5;
    else if (type === 'asteroid') cy = y + 2.5;
    else if (type === 'mine') cy = y + 1.5;
    else if (type === 'player') cy = y + 3;

    explosionsDataRef.current.push({
      id: `${type}_expl_${Math.random().toString(36).slice(2)}`,
      x: cx,
      y: cy,
      type,
      created: Date.now(),
    });

    spawnExplosionParticles(cx, cy, type);
    // Воспроизведение звука взрыва
    if (type === 'enemy') playSound(GAME_CONFIG.SOUND_ENEMY_EXPLOSION, soundVolumes.enemyExplosion);
    else if (type === 'asteroid') playSound(GAME_CONFIG.SOUND_ASTEROID_EXPLOSION, soundVolumes.asteroidExplosion);
    else if (type === 'mine') playSound(GAME_CONFIG.SOUND_MINE_EXPLOSION, soundVolumes.mineExplosion);
    else if (type === 'player') playSound(GAME_CONFIG.SOUND_PLAYER_EXPLOSION, soundVolumes.playerExplosion);
  }

  // Проверка завершения игры: по времени или по жизням
  useEffect(() => {
    if (showResults) return;
    // Если игрок погиб — поражение
    if (playerHP === 0) {
      setIsVictory(false);
      setTimeout(() => {
        setShowResults(true);
      }, 2000);
      return;
    }
    // Если время вышло, но босс ещё не побеждён — ничего не делаем, ждём фазу босса
    // Victory наступает только после bossPhase === 'exploding' (см. отдельный useEffect)
  }, [playerHP, showResults]);

  // Обработка нажатий и отпусканий клавиш
  useEffect(() => {
    if (showResults) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
        pressedKeys.current[e.key] = true;
        e.preventDefault();
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
        pressedKeys.current[e.key] = false;
        e.preventDefault();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [showResults]);

  // При завершении игры сбрасываем скорости и клавиши
  useEffect(() => {
    if (showResults) {
      setPlayerVX(0);
      setPlayerVY(0);
      pressedKeys.current = {};
      trackpadIntensity.current = {};
      // should entities be cleared here? no need any changes for now
    }
  }, [showResults]);

  // === ПАРАМЕТРЫ КОРАБЛЯ ПО УРОВНЯМ ===
  const SHIP_LEVELS = GAME_CONFIG.SHIP_LEVELS;
  const safeLevel = Math.max(1, Math.min(10, shipLevel || 1));
  const params = React.useMemo(() => SHIP_LEVELS[safeLevel] || SHIP_LEVELS[1], [safeLevel]);
  const bossParams = params.boss;

  // === СЧЁТЧИКИ УНИЧТОЖЕННЫХ ===
  const [enemiesKilled, setEnemiesKilled] = useState(0);
  const [asteroidsKilled, setAsteroidsKilled] = useState(0);
  const [minesKilled, setMinesKilled] = useState(0);

  const playerPositionRef = useRef({ x: 50, y: 10 });
  const playerVelocityRef = useRef({ x: 0, y: 0 });
  const playerImageRef = useRef<HTMLImageElement>(null);

  const getUpdatePlayerPosition = () => {
    const UPDATE_INTERVAL_MS = 16; // 60 FPS - legacy
    let lastTime = performance.now();

    return (currentTime: number) => {
      if (currentTime - lastTime < UPDATE_INTERVAL_MS) return;
      lastTime = currentTime;

      let vx = playerVelocityRef.current.x;
      let vy = playerVelocityRef.current.y;

      // Calculate input intensity for X axis
      let xIntensity = 0;

      if (pressedKeys.current['ArrowLeft']) {
        xIntensity = -(trackpadIntensity.current['ArrowLeft'] || 1); // Negative for left
      } else if (pressedKeys.current['ArrowRight']) {
        xIntensity = trackpadIntensity.current['ArrowRight'] || 1; // Positive for right
      }

      // Calculate input intensity for Y axis
      let yIntensity = 0;

      if (pressedKeys.current['ArrowUp']) {
        yIntensity = trackpadIntensity.current['ArrowUp'] || 1; // Positive for up
      } else if (pressedKeys.current['ArrowDown']) {
        yIntensity = -(trackpadIntensity.current['ArrowDown'] || 1); // Negative for down
      }

      // Apply movement with intensity-based acceleration and max speed
      if (xIntensity !== 0) {
        const targetSpeedX = PLAYER_MOVE.maxSpeedX * xIntensity;
        const accelX = PLAYER_MOVE.accelX * Math.abs(xIntensity);

        if (xIntensity < 0) {
          vx = Math.max(vx - accelX, targetSpeedX);
        } else {
          vx = Math.min(vx + accelX, targetSpeedX);
        }
      } else {
        // Торможение по X
        if (vx > 0) vx = Math.max(0, vx - PLAYER_MOVE.frictionX);
        if (vx < 0) vx = Math.min(0, vx + PLAYER_MOVE.frictionX);
      }

      if (yIntensity !== 0) {
        const targetSpeedY = PLAYER_MOVE.maxSpeedY * yIntensity;
        const accelY = PLAYER_MOVE.accelY * Math.abs(yIntensity);

        if (yIntensity < 0) {
          vy = Math.max(vy - accelY, targetSpeedY);
        } else {
          vy = Math.min(vy + accelY, targetSpeedY);
        }
      } else {
        // Торможение по Y
        if (vy > 0) vy = Math.max(0, vy - PLAYER_MOVE.frictionY);
        if (vy < 0) vy = Math.min(0, vy + PLAYER_MOVE.frictionY);
      }

      playerVelocityRef.current.x = vx;
      playerVelocityRef.current.y = vy;

      playerPositionRef.current.x = Math.max(X_MIN, Math.min(X_MAX, playerPositionRef.current.x + vx));
      playerPositionRef.current.y = Math.max(Y_MIN, Math.min(Y_MAX, playerPositionRef.current.y + vy));
    };
  };

  const renderPlayer = () => {
    if (!playerImageRef.current) return;

    playerImageRef.current.style.bottom = `${playerPositionRef.current.y}%`;
    playerImageRef.current.style.left = `${playerPositionRef.current.x}%`;
  };

  const playerLasersDataRef = useRef<{ id: string; x: number; y: number }[]>([]);
  const gameAreaRef = useRef<HTMLDivElement>(null);

  const getUpdatePlayerLasers = () => {
    let lastSpawnTime = performance.now();
    let lastUpdateTime = performance.now();

    return (currentTime: number) => {
      const spawn = () => {
        if (currentTime - lastSpawnTime < params.laserRate * fireRateMultiplierRef.current) return;
        lastSpawnTime = currentTime;

        const laserCount = params.lasers;

        const lasers = Array.from({ length: laserCount }).map((_, i) => {
          const spread = 7 * (laserCount > 1 ? i - (laserCount - 1) / 2 : 0);

          return {
            id: `laser_${Math.random().toString(36).slice(2)}`,
            x: playerPositionRef.current.x + spread,
            y: playerPositionRef.current.y + GAME_CONFIG.PLAYER_LASER_SPEED,
          };
        });

        playerLasersDataRef.current.push(...lasers);
        playSound(GAME_CONFIG.SOUND_PLAYER_LASER, soundVolumes.playerLaser);
      };

      const update = () => {
        const LASER_UPDATE_INTERVAL = 16; // 60 FPS - legacy

        if (currentTime - lastUpdateTime < LASER_UPDATE_INTERVAL) return;
        lastUpdateTime = currentTime;

        playerLasersDataRef.current = playerLasersDataRef.current
          .map((laser) => ({
            ...laser,
            y: laser.y + GAME_CONFIG.PLAYER_LASER_SPEED,
          }))
          .filter((laser) => laser.y < 110);
      };

      spawn();
      update();
    };
  };

  const renderPlayerLasers = () => {
    if (!gameAreaRef.current) return;

    const existingLasers = gameAreaRef.current.querySelectorAll('[data-laser-id]');

    const currentLaserIds = new Set(playerLasersDataRef.current.map((laser) => laser.id));

    existingLasers.forEach((el) => {
      const id = el.getAttribute('data-laser-id');

      if (id && !currentLaserIds.has(id)) el.remove();
    });

    playerLasersDataRef.current.forEach((laser) => {
      let laserElement = gameAreaRef.current!.querySelector(`[data-laser-id="${laser.id}"]`) as HTMLDivElement;

      if (!laserElement) {
        laserElement = document.createElement('div');
        laserElement.setAttribute('data-laser-id', laser.id);
        laserElement.className = 'absolute';
        laserElement.style.width = `${PLAYER_LASER_WIDTH}px`;
        laserElement.style.height = `${PLAYER_LASER_HEIGHT}px`;
        laserElement.style.transform = 'translate(-50%, 0)';
        laserElement.style.zIndex = '5';
        gameAreaRef.current!.appendChild(laserElement);
      }

      laserElement.style.left = `${laser.x}%`;
      laserElement.style.bottom = `${laser.y}%`;
      laserElement.style.backgroundColor = activeBoosterRef.current ? PLAYER_LASER_COLOR_BOOST : PLAYER_LASER_COLOR;

      laserElement.style.boxShadow = activeBoosterRef.current
        ? GAME_CONFIG.PLAYER_LASER_GLOW_BOOST
        : GAME_CONFIG.PLAYER_LASER_GLOW;
    });
  };

  const playerRocketsDataRef = useRef<{ id: string; x: number; y: number }[]>([]);

  const getUpdatePlayerRockets = () => {
    const ROCKET_UPDATE_INTERVAL = 16; // 60 FPS - legacy
    let lastSpawnTime = performance.now();
    let lastUpdateTime = performance.now();

    return (currentTime: number) => {
      const spawn = () => {
        if (currentTime - lastSpawnTime < params.rocketRate * fireRateMultiplierRef.current) return;
        lastSpawnTime = currentTime;

        const rocketCount = params.rockets;
        const newRockets = Array.from({ length: rocketCount }).map(() => ({
          id: `rocket_${Math.random().toString(36).slice(2)}`,
          x: playerPositionRef.current.x,
          y: playerPositionRef.current.y + GAME_CONFIG.PLAYER_ROCKET_SPEED,
          type: 'rocket',
        }));

        playerRocketsDataRef.current.push(...newRockets);
        playSound(GAME_CONFIG.SOUND_PLAYER_ROCKET, soundVolumes.playerRocket);
      };

      const update = () => {
        if (currentTime - lastUpdateTime < ROCKET_UPDATE_INTERVAL) return;
        lastUpdateTime = currentTime;

        playerRocketsDataRef.current = playerRocketsDataRef.current
          .map((rocket) => ({
            ...rocket,
            y: rocket.y + GAME_CONFIG.PLAYER_ROCKET_SPEED,
          }))
          .filter((rocket) => rocket.y < 110);
      };

      spawn();
      update();
    };
  };

  const renderPlayerRockets = () => {
    if (!gameAreaRef.current) return;

    const existingRockets = gameAreaRef.current.querySelectorAll('[data-rocket-id]');

    const currentRocketIds = new Set(playerRocketsDataRef.current.map((rocket) => rocket.id));
    existingRockets.forEach((el) => {
      const id = el.getAttribute('data-rocket-id');
      if (id && !currentRocketIds.has(id)) el.remove();
    });

    playerRocketsDataRef.current.forEach((rocket) => {
      let rocketElement = gameAreaRef.current!.querySelector(`[data-rocket-id="${rocket.id}"]`) as HTMLDivElement;

      if (!rocketElement) {
        rocketElement = document.createElement('div');
        rocketElement.setAttribute('data-rocket-id', rocket.id);
        rocketElement.className = 'absolute rounded-full shadow-lg';
        rocketElement.style.width = `${PLAYER_ROCKET_WIDTH}px`;
        rocketElement.style.height = `${PLAYER_ROCKET_HEIGHT}px`;
        rocketElement.style.transform = 'translateX(-50%)';
        rocketElement.style.zIndex = '5';
        rocketElement.style.opacity = '0.95';
        gameAreaRef.current!.appendChild(rocketElement);
      }

      rocketElement.style.left = `${rocket.x}%`;
      rocketElement.style.bottom = `${rocket.y}%`;
      rocketElement.style.backgroundColor = PLAYER_ROCKET_COLOR;
      rocketElement.style.boxShadow = GAME_CONFIG.PLAYER_ROCKET_GLOW;
    });
  };

  const asteroidsDataRef = useRef<
    { id: string; x: number; y: number; speed: number; rotation: number; rotationSpeed: number }[]
  >([]);
  const minesDataRef = useRef<{ id: string; x: number; y: number; speed: number }[]>([]);

  const getUpdateAsteroids = () => {
    let lastSpawnTime = performance.now();
    let lastUpdateTime = performance.now();

    return (currentTime: number) => {
      const spawn = () => {
        if (currentTime - lastSpawnTime < params.asteroidInterval) return;
        lastSpawnTime = currentTime;

        const id = `asteroid_${Math.random().toString(36).slice(2)}`;

        asteroidsDataRef.current.push({
          id,
          x: Math.random() * 90,
          y: 100,
          speed: ASTEROID_SPEED_MIN + Math.random() * (ASTEROID_SPEED_MAX - ASTEROID_SPEED_MIN),
          rotation: Math.random() * 360,
          rotationSpeed:
            GAME_CONFIG.ASTEROID_ROTATION_SPEED_MIN +
            Math.random() * (GAME_CONFIG.ASTEROID_ROTATION_SPEED_MAX - GAME_CONFIG.ASTEROID_ROTATION_SPEED_MIN),
        });
      };

      const update = () => {
        const now = performance.now();
        if (now - lastUpdateTime < 16) return; // 60 fps - legacy

        const dt = (now - lastUpdateTime) / 1000; // Delta time in seconds
        lastUpdateTime = now;

        asteroidsDataRef.current = asteroidsDataRef.current
          .map((asteroid) => ({
            ...asteroid,
            y: asteroid.y - (asteroid.speed || 0) * dt,
            rotation: (asteroid.rotation || 0) + (asteroid.rotationSpeed || 0) * dt,
          }))
          .filter((asteroid) => asteroid.y > -10);
      };

      spawn();
      update();
    };
  };

  const renderAsteroids = () => {
    if (!gameAreaRef.current) return;

    const existingAsteroids = gameAreaRef.current.querySelectorAll('[data-asteroid-id]');
    const currentAsteroidIds = new Set(asteroidsDataRef.current.map((asteroid) => asteroid.id));

    existingAsteroids.forEach((element) => {
      const asteroidId = element.getAttribute('data-asteroid-id');
      if (!currentAsteroidIds.has(asteroidId!)) {
        element.remove();
      }
    });

    asteroidsDataRef.current.forEach((asteroid) => {
      let asteroidElement = gameAreaRef.current!.querySelector(`[data-asteroid-id="${asteroid.id}"]`) as HTMLDivElement;

      if (!asteroidElement) {
        asteroidElement = document.createElement('div');
        asteroidElement.setAttribute('data-asteroid-id', asteroid.id);
        asteroidElement.className = 'absolute pointer-events-none';
        asteroidElement.style.width = `${ASTEROID_SIZE_MIN + Math.random() * (ASTEROID_SIZE_MAX - ASTEROID_SIZE_MIN)}px`;
        asteroidElement.style.height = asteroidElement.style.width;
        asteroidElement.style.backgroundImage = 'url(/img/asteroid.png)';
        asteroidElement.style.backgroundSize = 'contain';
        asteroidElement.style.backgroundRepeat = 'no-repeat';
        asteroidElement.style.backgroundPosition = 'center';
        gameAreaRef.current!.appendChild(asteroidElement);
      }

      asteroidElement.style.bottom = `${asteroid.y}%`;
      asteroidElement.style.left = `${asteroid.x}%`;
      asteroidElement.style.transform = `rotate(${asteroid.rotation}deg)`;
    });
  };

  const getUpdateMines = () => {
    let lastSpawnTime = performance.now();
    let lastUpdateTime = performance.now();

    return (currentTime: number) => {
      const spawn = () => {
        if (currentTime - lastSpawnTime < params.mineInterval) return;
        lastSpawnTime = currentTime;

        const id = `mine_${Math.random().toString(36).slice(2)}`;
        minesDataRef.current.push({
          id,
          x: Math.random() * 90 + 5,
          y: 100,
          speed: MINE_SPEED,
        });
      };

      const update = () => {
        const now = performance.now();
        if (now - lastUpdateTime < 16) return; // 60 fps - legacy

        const dt = (now - lastUpdateTime) / 1000; // Delta time in seconds
        lastUpdateTime = now;

        minesDataRef.current = minesDataRef.current
          .map((mine) => ({ ...mine, y: mine.y - (mine.speed || 0) * dt }))
          .filter((mine) => mine.y > -10);
      };

      spawn();
      update();
    };
  };

  const renderMines = () => {
    if (!gameAreaRef.current) return;

    const existingMines = gameAreaRef.current.querySelectorAll('[data-mine-id]');
    const currentMineIds = new Set(minesDataRef.current.map((mine) => mine.id));

    existingMines.forEach((element) => {
      const mineId = element.getAttribute('data-mine-id');
      if (!currentMineIds.has(mineId!)) {
        element.remove();
      }
    });

    minesDataRef.current.forEach((mine) => {
      let mineElement = gameAreaRef.current!.querySelector(`[data-mine-id="${mine.id}"]`) as HTMLDivElement;

      if (!mineElement) {
        mineElement = document.createElement('div');
        mineElement.setAttribute('data-mine-id', mine.id);
        mineElement.className = 'absolute pointer-events-none';
        mineElement.style.width = `${MINE_SIZE}px`;
        mineElement.style.height = `${MINE_SIZE}px`;
        mineElement.style.backgroundImage = 'url(/img/mine.png)';
        mineElement.style.backgroundSize = 'contain';
        mineElement.style.backgroundRepeat = 'no-repeat';
        mineElement.style.backgroundPosition = 'center';
        gameAreaRef.current!.appendChild(mineElement);
      }

      mineElement.style.bottom = `${mine.y}%`;
      mineElement.style.left = `${mine.x}%`;
    });
  };

  const boostersDataRef = useRef<{ id: string; x: number; y: number; rotation: number }[]>([]);

  const getUpdateBoosters = () => {
    const timings = getBoosterSpawnTimings();
    let lastSpawnTime = performance.now();
    let lastUpdateTime = performance.now();
    let boosterIndex = 0;

    return (currentTime: number) => {
      const spawn = () => {
        if (boosterIndex >= timings.length) return;

        const appearTime = timings[boosterIndex] * 1000; // Convert to milliseconds
        if (currentTime - lastSpawnTime < appearTime) return;

        boostersDataRef.current.push({
          id: `booster_${Date.now()}_${boosterIndex}`,
          x: Math.random() * 80 + 10, // 10-90% width
          y: 100, // from top
          rotation: Math.random() * 360,
        });

        boosterIndex++;
        lastSpawnTime = currentTime;
      };

      const update = () => {
        const now = performance.now();
        if (now - lastUpdateTime < 16) return; // 60 FPS limit

        const dt = (now - lastUpdateTime) / 1000; // Delta time in seconds
        lastUpdateTime = now;

        // Movement and rotation - separate forEach iteration
        boostersDataRef.current = boostersDataRef.current
          .map((booster) => ({
            ...booster,
            y: booster.y - BOOSTER_CONFIG.speed * dt,
            rotation: (booster.rotation + BOOSTER_CONFIG.rotationSpeed * dt * 360) % 360,
          }))
          // Collision detection with player
          .filter((booster) => {
            if (booster.y <= -BOOSTER_CONFIG.size) return false; // удаляем если вышел за пределы поля

            const dx = booster.x - playerXRef.current;
            const dy = booster.y - playerYRef.current;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < BOOSTER_HITBOX + PLAYER_HITBOX) {
              activateBooster();
              playSound(BOOSTER_CONFIG.soundActivate, soundVolumes.boosterActivate);

              return false; // удаляем бустер
            }

            return true;
          });
      };

      spawn();
      update();
    };
  };

  const renderBoosters = () => {
    if (!gameAreaRef.current) return;

    const existingBoosters = gameAreaRef.current.querySelectorAll('[data-booster-id]');
    const currentBoosterIds = new Set(boostersDataRef.current.map((booster) => booster.id));

    existingBoosters.forEach((element) => {
      const boosterId = element.getAttribute('data-booster-id');
      if (!currentBoosterIds.has(boosterId!)) {
        element.remove();
      }
    });

    boostersDataRef.current.forEach((booster) => {
      let boosterElement = gameAreaRef.current!.querySelector(`[data-booster-id="${booster.id}"]`) as HTMLDivElement;

      if (!boosterElement) {
        boosterElement = document.createElement('div');
        boosterElement.setAttribute('data-booster-id', booster.id);
        boosterElement.className = 'absolute pointer-events-none';
        boosterElement.style.width = `${BOOSTER_CONFIG.size}px`;
        boosterElement.style.height = `${BOOSTER_CONFIG.size}px`;
        boosterElement.style.backgroundImage = 'url(/img/booster.png)';
        boosterElement.style.backgroundSize = 'contain';
        boosterElement.style.backgroundRepeat = 'no-repeat';
        boosterElement.style.backgroundPosition = 'center';
        boosterElement.style.zIndex = '1';
        gameAreaRef.current!.appendChild(boosterElement);
      }

      boosterElement.style.bottom = `${booster.y}%`;
      boosterElement.style.left = `${booster.x}%`;
      boosterElement.style.transform = `translateX(-50%) rotate(${booster.rotation}deg)`;
    });
  };

  const enemiesDataRef = useRef<
    {
      id: string;
      x: number;
      y: number;
      speed: number;
      x0: number;
      y0: number;
      ampX: number;
      phaseX: number;
      ampY: number;
      phaseY: number;
      born: number;
    }[]
  >([]);
  const enemyLasersDataRef = useRef<
    { id: string; x: number; y: number; type: string; vx: number; vy: number; t: number }[]
  >([]);

  const getUpdateEnemies = () => {
    let lastSpawnTime = performance.now();
    let lastUpdateTime = performance.now();

    return (currentTime: number) => {
      const spawn = () => {
        if (currentTime - lastSpawnTime < params.enemyInterval) return;
        lastSpawnTime = currentTime;

        const cfg = GAME_CONFIG.ENEMY_TRAJECTORY_CONFIG;
        const id = `enemy_${Math.random().toString(36).slice(2)}`;
        const x0 = cfg.X0_MIN + Math.random() * (cfg.X0_MAX - cfg.X0_MIN);
        const ampX = cfg.AMP_X_MIN + Math.random() * (cfg.AMP_X_MAX - cfg.AMP_X_MIN);
        const phaseX = cfg.PHASE_X_MIN + Math.random() * (cfg.PHASE_X_MAX - cfg.PHASE_X_MIN);
        const ampY = cfg.AMP_Y_MIN + Math.random() * (cfg.AMP_Y_MAX - cfg.AMP_Y_MIN);
        const phaseY = cfg.PHASE_Y_MIN + Math.random() * (cfg.PHASE_Y_MAX - cfg.PHASE_Y_MIN);

        enemiesDataRef.current.push({
          id,
          x: x0,
          y: 100,
          speed:
            GAME_CONFIG.ENEMY_SPEED_MIN + Math.random() * (GAME_CONFIG.ENEMY_SPEED_MAX - GAME_CONFIG.ENEMY_SPEED_MIN),
          x0,
          y0: 100,
          ampX,
          phaseX,
          ampY,
          phaseY,
          born: Date.now(),
        });
      };

      const update = () => {
        const now = performance.now();
        if (now - lastUpdateTime < 16) return; // 60 FPS limit

        const dt = (now - lastUpdateTime) / 1000; // Delta time in seconds
        lastUpdateTime = now;

        // Movement - separate forEach iteration using original trajectory logic
        enemiesDataRef.current = enemiesDataRef.current
          .map((enemy) => ({
            ...enemy,
            y: enemy.y - (enemy.speed || 0) * dt,
            // Используем частоту синусоиды из конфига
            x:
              (enemy.x0 ?? 0) +
              (enemy.ampX || 0) *
                Math.sin(
                  ((Date.now() - (enemy.born || 0)) / 1000) * GAME_CONFIG.ENEMY_TRAJECTORY_CONFIG.SIN_FREQ +
                    (enemy.phaseX || 0),
                ),
          }))
          .filter((enemy) => enemy.y > -10);
      };

      spawn();
      update();
    };
  };

  const renderEnemies = () => {
    if (!gameAreaRef.current) return;

    const existingEnemies = gameAreaRef.current.querySelectorAll('[data-enemy-id]');
    const currentEnemyIds = new Set(enemiesDataRef.current.map((enemy) => enemy.id));

    existingEnemies.forEach((element) => {
      const enemyId = element.getAttribute('data-enemy-id');
      if (!currentEnemyIds.has(enemyId!)) {
        element.remove();
      }
    });

    enemiesDataRef.current.forEach((enemy) => {
      let enemyElement = gameAreaRef.current!.querySelector(`[data-enemy-id="${enemy.id}"]`) as HTMLDivElement;

      if (!enemyElement) {
        enemyElement = document.createElement('div');
        enemyElement.setAttribute('data-enemy-id', enemy.id);
        enemyElement.className = 'absolute pointer-events-none';
        enemyElement.style.width = `${ENEMY_SIZE}px`;
        enemyElement.style.height = `${ENEMY_SIZE}px`;
        enemyElement.style.backgroundImage = 'url(/img/alien-ship.png)';
        enemyElement.style.backgroundSize = 'contain';
        enemyElement.style.backgroundRepeat = 'no-repeat';
        enemyElement.style.backgroundPosition = 'center';
        enemyElement.style.zIndex = '2';
        gameAreaRef.current!.appendChild(enemyElement);
      }

      enemyElement.style.bottom = `${enemy.y}%`;
      enemyElement.style.left = `${enemy.x}%`;
      enemyElement.style.transform = 'translateX(-50%)';
    });
  };

  const getUpdateEnemyLasers = () => {
    let lastSpawnTime = performance.now();
    let lastUpdateTime = performance.now();

    return (currentTime: number) => {
      const spawn = () => {
        const SPAWN_INTERVAL_MS = 1000; // 1 second
        if (currentTime - lastSpawnTime < SPAWN_INTERVAL_MS) return;
        lastSpawnTime = currentTime;

        const shooters = enemiesDataRef.current.filter((enemy) => enemy.y > GAME_CONFIG.ENEMY_FIRE_Y_MIN);
        if (shooters.length <= 0) return;

        shooters.forEach((enemy) => {
          // Calculate direction vector to player
          const dx = playerPositionRef.current.x - enemy.x;
          const dy = playerPositionRef.current.y - enemy.y;
          const len = Math.sqrt(dx * dx + dy * dy) || 1;
          const vx = (dx / len) * GAME_CONFIG.ENEMY_LASER_SPEED;
          const vy = (dy / len) * GAME_CONFIG.ENEMY_LASER_SPEED;

          enemyLasersDataRef.current.push({
            id: `enemyLaser_${enemy.id}_${Math.random().toString(36).slice(2)}`,
            x: enemy.x,
            y: enemy.y,
            type: 'enemyLaser',
            vx,
            vy,
            t: 0,
          });
        });
      };

      const update = () => {
        const now = performance.now();
        if (now - lastUpdateTime < 16) return; // 60 FPS limit

        lastUpdateTime = now;

        enemyLasersDataRef.current = enemyLasersDataRef.current
          .map((laser) => ({
            ...laser,
            x: laser.x + (laser.vx || 0),
            y: laser.y + (laser.vy || 0),
          }))
          .filter((laser) => laser.y > -10 && laser.y < 110);
      };

      spawn();
      update();
    };
  };

  const renderEnemyLasers = () => {
    if (!gameAreaRef.current) return;

    const existingLasers = gameAreaRef.current.querySelectorAll('[data-enemy-laser-id]');
    const currentLaserIds = new Set(enemyLasersDataRef.current.map((laser) => laser.id));

    existingLasers.forEach((element) => {
      const laserId = element.getAttribute('data-enemy-laser-id');
      if (!currentLaserIds.has(laserId!)) {
        element.remove();
      }
    });

    enemyLasersDataRef.current.forEach((laser) => {
      let laserElement = gameAreaRef.current!.querySelector(`[data-enemy-laser-id="${laser.id}"]`) as HTMLDivElement;

      if (!laserElement) {
        laserElement = document.createElement('div');
        laserElement.setAttribute('data-enemy-laser-id', laser.id);
        laserElement.className = 'absolute pointer-events-none';

        // Conditional logic for boss types
        if (laser.type === 'bossLaser') {
          laserElement.style.width = `${BOSS_CONFIG.laserWidth}px`;
          laserElement.style.height = `${BOSS_CONFIG.laserHeight}px`;
          laserElement.style.background = BOSS_CONFIG.laserColor;
          laserElement.style.boxShadow = GAME_CONFIG.BOSS_LASER_GLOW;
          laserElement.style.borderRadius = '50%';
          laserElement.style.opacity = '0.95';
          laserElement.style.zIndex = '6';
        } else if (laser.type === 'bossRocket') {
          laserElement.style.width = `${BOSS_CONFIG.rocketWidth}px`;
          laserElement.style.height = `${BOSS_CONFIG.rocketHeight}px`;
          laserElement.style.background = BOSS_CONFIG.rocketColor;
          laserElement.style.boxShadow = GAME_CONFIG.BOSS_ROCKET_GLOW;
          laserElement.style.border = BOSS_CONFIG.rocketBorder;
          laserElement.style.borderRadius = '50%';
          laserElement.style.opacity = '0.98';
          laserElement.style.zIndex = '7';
        } else {
          // Default enemy laser styling
          laserElement.style.width = `${ENEMY_LASER_WIDTH}px`;
          laserElement.style.height = `${ENEMY_LASER_HEIGHT}px`;
          laserElement.style.backgroundColor = '#ff6b6b';
          laserElement.style.borderRadius = '50%';
          laserElement.style.boxShadow = '0 0 10px #ff6b6b';
          laserElement.style.zIndex = '3';
        }

        gameAreaRef.current!.appendChild(laserElement);
      }

      laserElement.style.bottom = `${laser.y}%`;
      laserElement.style.left = `${laser.x}%`;
      laserElement.style.transform = 'translateX(-50%)';
    });
  };

  const bossDataRef = useRef<{
    id: string;
    x: number;
    y: number;
    speed: number;
    x0: number;
    y0: number;
    ampX: number;
    phaseX: number;
    ampY: number;
    phaseY: number;
    born: number;
    hp: number;
    exists: boolean;
    phase: 'idle' | 'active' | 'exploding' | 'defeated' | 'appearing';
  }>({
    id: 'boss',
    x: (BOSS_CONFIG.trajectory.X_MIN + BOSS_CONFIG.trajectory.X_MAX) / 2,
    y: BOSS_CONFIG.trajectory.Y_APPEAR, // старт вне поля
    speed: BOSS_CONFIG.speed,
    x0: (BOSS_CONFIG.trajectory.X_MIN + BOSS_CONFIG.trajectory.X_MAX) / 2,
    y0: BOSS_CONFIG.trajectory.Y_TARGET, // рабочая позиция по Y
    ampX: BOSS_CONFIG.trajectory.AMP_X,
    phaseX: BOSS_CONFIG.trajectory.PHASE_X,
    ampY: BOSS_CONFIG.trajectory.AMP_Y,
    phaseY: BOSS_CONFIG.trajectory.PHASE_Y,
    born: Date.now(),
    hp: 0,
    exists: false,
    phase: 'idle',
  });

  const getUpdateBoss = () => {
    let lastUpdateTime = performance.now();

    return (currentTime: number) => {
      if (currentTime - lastUpdateTime < 16) return; // 60 FPS limit
      lastUpdateTime = currentTime;

      const bossData = bossDataRef.current;
      if (!bossData.exists) return;

      const dt = (currentTime - lastUpdateTime) / 1000;

      if (bossData.phase === 'appearing') {
        // === Анимация появления ===
        const yNow = bossData.y;
        const yTarget = BOSS_CONFIG.trajectory.Y_TARGET;
        const appearSpeed = BOSS_CONFIG.trajectory.APPEAR_SPEED * dt; // %/сек
        let newY = yNow + appearSpeed;

        if (newY >= yTarget) {
          newY = yTarget;
          // Фиксируем x0/y0, сбрасываем фазы и born (для плавного старта синусоиды)
          bossDataRef.current = {
            ...bossData,
            y: newY,
            x0: bossData.x,
            y0: newY,
            phaseX: 0,
            phaseY: 0,
            born: Date.now(), // сброс времени для t=0
            phase: 'active',
          };
        } else {
          bossDataRef.current = { ...bossData, y: newY };
        }

        return;
      }

      if (bossData.phase === 'active') {
        // === Обычная траектория ===
        const t = (Date.now() - (bossData.born || 0)) / 1000;

        // Y: синусоида вокруг y0
        const yAmp = BOSS_CONFIG.trajectory.AMP_Y;
        const newY =
          (bossData.y0 ?? BOSS_CONFIG.trajectory.Y_TARGET) +
          yAmp * Math.sin(t * BOSS_CONFIG.trajectory.SIN_FREQ + (bossData.phaseY || 0));

        // X: синусоида вокруг x0
        const xAmp = BOSS_CONFIG.trajectory.AMP_X;
        const newX =
          (bossData.x0 ?? (BOSS_CONFIG.trajectory.X_MIN + BOSS_CONFIG.trajectory.X_MAX) / 2) +
          xAmp * Math.sin(t * BOSS_CONFIG.trajectory.SIN_FREQ + (bossData.phaseX || 0));

        bossDataRef.current = { ...bossData, x: newX, y: newY };
      }
    };
  };

  const renderBoss = () => {
    if (!gameAreaRef.current) return;

    const bossData = bossDataRef.current;

    // Remove existing boss elements if they shouldn't exist
    const existingBoss = gameAreaRef.current.querySelector('[data-boss-id]') as HTMLImageElement;
    const existingHpBar = gameAreaRef.current.querySelector('[data-boss-hp-id]') as HTMLDivElement;

    if (!bossData.exists || bossData.phase === 'exploding') {
      if (existingBoss) existingBoss.remove();
      if (existingHpBar) existingHpBar.remove();
      return;
    }

    // Render boss image
    let bossElement = existingBoss;
    if (!bossElement) {
      bossElement = document.createElement('img');
      bossElement.setAttribute('data-boss-id', bossData.id);
      bossElement.src = BOSS_CONFIG.img;
      bossElement.alt = 'boss';
      bossElement.className = 'absolute select-none pointer-events-none';
      bossElement.style.width = `${BOSS_CONFIG.size}px`;
      bossElement.style.height = `${BOSS_CONFIG.size}px`;
      bossElement.style.transform = 'translateX(-50%)';
      bossElement.style.zIndex = '20';
      bossElement.style.userSelect = 'none';
      bossElement.style.opacity = '1';
      bossElement.style.filter = 'none';
      gameAreaRef.current.appendChild(bossElement);
    }

    bossElement.style.left = `${bossData.x}%`;
    bossElement.style.bottom = `${bossData.y}%`;

    // Render HP bar only in 'active' phase
    if (bossData.phase === 'active') {
      let hpBarElement = existingHpBar;
      if (!hpBarElement) {
        hpBarElement = document.createElement('div');
        hpBarElement.setAttribute('data-boss-hp-id', 'boss-hp');
        hpBarElement.className = 'absolute left-1/2 top-2 -translate-x-1/2 z-50 flex flex-col items-center';

        const hpContainer = document.createElement('div');
        hpContainer.className =
          'w-48 h-3 bg-gray-800 rounded-full border border-yellow-400 mt-1 mb-1 flex items-center relative';

        const hpFill = document.createElement('div');
        hpFill.className = 'h-3 rounded-full bg-gradient-to-r from-yellow-300 to-red-500 absolute left-0 top-0';
        hpFill.style.transition = 'width 0.2s';
        hpFill.style.zIndex = '1';

        const hpLabel = document.createElement('span');
        hpLabel.className =
          'absolute w-full text-center text-yellow-300 font-bold text-xs tracking-widest uppercase drop-shadow-lg';
        hpLabel.style.fontSize = '13px';
        hpLabel.style.letterSpacing = '2px';
        hpLabel.style.zIndex = '2';
        hpLabel.textContent = 'Mothership';

        hpContainer.appendChild(hpFill);
        hpContainer.appendChild(hpLabel);
        hpBarElement.appendChild(hpContainer);
        gameAreaRef.current.appendChild(hpBarElement);
      }

      // Update HP bar width
      const maxHP = params.boss?.bossHP || 30;
      const hpPercentage = (bossData.hp / maxHP) * 100;
      const hpFill = hpBarElement.querySelector('.bg-gradient-to-r') as HTMLDivElement;
      if (hpFill) {
        hpFill.style.width = `${hpPercentage}%`;
      }
    } else {
      // Remove HP bar if not in active phase
      if (existingHpBar) {
        existingHpBar.remove();
      }
    }
  };

  const getUpdateBossLasers = () => {
    let lastSpawnTime = performance.now();

    return (currentTime: number) => {
      const spawn = () => {
        if (!bossParams || !bossDataRef.current.exists || bossDataRef.current.phase !== 'active') return;
        if (currentTime - lastSpawnTime < bossParams.laserRate) return;
        lastSpawnTime = currentTime;

        const muzzleX = bossDataRef.current.x;
        const muzzleY = bossDataRef.current.y;

        const lasers = Array.from({ length: bossParams.laserCount }).map(() => {
          const dx = playerPositionRef.current.x - muzzleX;
          const dy = playerPositionRef.current.y - muzzleY;
          const len = Math.sqrt(dx * dx + dy * dy) || 1;
          const vx = (dx / len) * BOSS_CONFIG.laserSpeed;
          const vy = (dy / len) * BOSS_CONFIG.laserSpeed;

          return {
            id: `bossLaser_${Math.random().toString(36).slice(2)}`,
            x: muzzleX,
            y: muzzleY,
            type: 'bossLaser',
            vx,
            vy,
            t: 0,
          };
        });

        enemyLasersDataRef.current.push(...lasers);
        playSound(BOSS_CONFIG.soundLaser, 0.8);
      };

      spawn();
    };
  };

  const getUpdateBossRockets = () => {
    let lastSpawnTime = performance.now();

    return (currentTime: number) => {
      const spawn = () => {
        if (!bossParams || !bossDataRef.current.exists || bossDataRef.current.phase !== 'active') return;
        if (currentTime - lastSpawnTime < bossParams.rocketRate) return;
        lastSpawnTime = currentTime;

        const muzzleX = bossDataRef.current.x;
        const muzzleY = bossDataRef.current.y;

        const rockets = Array.from({ length: bossParams.rocketCount }).map(() => {
          const dx = playerPositionRef.current.x - muzzleX;
          const dy = playerPositionRef.current.y - muzzleY;
          const len = Math.sqrt(dx * dx + dy * dy) || 1;
          const vx = (dx / len) * BOSS_CONFIG.rocketSpeed;
          const vy = (dy / len) * BOSS_CONFIG.rocketSpeed;

          return {
            id: `bossRocket_${Math.random().toString(36).slice(2)}`,
            x: muzzleX,
            y: muzzleY,
            type: 'bossRocket',
            vx,
            vy,
            t: 0,
          };
        });

        enemyLasersDataRef.current.push(...rockets);
        playSound(BOSS_CONFIG.soundRocket, 0.9);
      };

      spawn();
    };
  };

  const { fps, updateFps } = useFps();
  const { gameTime, updateGameTime } = useGameTime();

  // Particles update function
  const updateExplosionParticles = () => {
    particlesDataRef.current = particlesDataRef.current
      .map((p) => {
        // Update position
        let nx = p.x + p.vx;
        let ny = p.y + p.vy;
        // Constrain within 0-100%
        if (nx < 0) nx = 0;
        if (nx > 100) nx = 100;
        if (ny < 0) ny = 0;
        if (ny > 100) ny = 100;
        return { ...p, x: nx, y: ny };
      })
      .filter((p) => Date.now() - p.created < p.life);
  };

  // Particles render function
  const renderExplosionParticles = () => {
    if (!gameAreaRef.current) return;

    const existingParticles = gameAreaRef.current.querySelectorAll('[data-particle-id]');
    const currentParticleIds = new Set(particlesDataRef.current.map((p) => p.id));

    // Remove particles that no longer exist
    existingParticles.forEach((element) => {
      const particleId = element.getAttribute('data-particle-id');
      if (!currentParticleIds.has(particleId!)) {
        element.remove();
      }
    });

    // Create/update existing particles
    particlesDataRef.current.forEach((particle) => {
      let particleElement = gameAreaRef.current!.querySelector(`[data-particle-id="${particle.id}"]`) as HTMLDivElement;

      if (!particleElement) {
        particleElement = document.createElement('div');
        particleElement.setAttribute('data-particle-id', particle.id);
        particleElement.className = 'absolute pointer-events-none';
        particleElement.style.width = `${particle.size}px`;
        particleElement.style.height = `${particle.size}px`;
        particleElement.style.background = particle.color;
        particleElement.style.borderRadius = '50%';
        particleElement.style.opacity = '0.7';
        particleElement.style.zIndex = '30';
        particleElement.style.transform = 'translateX(-50%) translateY(50%)';
        particleElement.style.boxShadow = `0 0 8px 2px ${particle.color}`;
        particleElement.style.transition = 'opacity 0.2s';
        gameAreaRef.current!.appendChild(particleElement);
      }

      particleElement.style.left = `${particle.x}%`;
      particleElement.style.bottom = `${particle.y}%`;
    });
  };

  const updateExplosions = () => {
    explosionsDataRef.current = explosionsDataRef.current.filter((e) => Date.now() - e.created < 600);
  };

  useEffect(() => {
    let requestId: number;
    let lastGameUpdate = Date.now();

    const updatePlayerPosition = getUpdatePlayerPosition();
    const updatePlayerLasers = getUpdatePlayerLasers();
    const updatePlayerRockets = getUpdatePlayerRockets();
    const updateAsteroids = getUpdateAsteroids();
    const updateMines = getUpdateMines();
    const updateBoosters = getUpdateBoosters();
    const updateEnemies = getUpdateEnemies();
    const updateEnemyLasers = getUpdateEnemyLasers();
    const updateBossLasers = getUpdateBossLasers();
    const updateBossRockets = getUpdateBossRockets();
    const updateBoss = getUpdateBoss();

    function gameLoop(currentTime: number) {
      updateFps(currentTime);
      updateGameTime(currentTime); // no need if showResults

      updatePlayerPosition(currentTime); // no need if showResults || !playerExists
      updatePlayerLasers(currentTime); // no need if showResults || !playerExists
      updatePlayerRockets(currentTime); // no need if showResults || !playerExists
      updateAsteroids(currentTime); // no need if showResults
      updateMines(currentTime); // no need if showResults || bossExists
      updateBoosters(currentTime); // no need if showResults
      updateEnemies(currentTime); // no need if showResults || bossExists
      updateEnemyLasers(currentTime); // no need if showResults || !playerExists
      updateBoss(currentTime); // no need if showResults
      updateBossLasers(currentTime); // no need if !bossExists || bossPhase !== 'active' || !bossParams || !playerExists
      updateBossRockets(currentTime); // no need if !bossExists || bossPhase !== 'active' || !bossParams || !playerExists
      updateExplosions(); // no need if !explosionsDataRef.current.length

      renderPlayer();
      renderPlayerLasers();
      renderPlayerRockets();
      renderAsteroids();
      renderMines();
      renderBoosters();
      renderEnemies();
      renderEnemyLasers();
      renderBoss();
      renderExplosionParticles();

      const now = Date.now();

      // Maintain 30ms interval equivalent (33.33 FPS)
      if (now - lastGameUpdate < 30) {
        requestId = requestAnimationFrame(gameLoop);
        return;
      }

      lastGameUpdate = now;
      // === ДВИЖЕНИЕ и СТОЛКНОВЕНИЯ ===
      // --- Берём только актуальные значения из useRef ---
      const newEnemies = [...enemiesDataRef.current];
      const newAsteroids = [...asteroidsDataRef.current];
      const newMines = [...minesDataRef.current];
      const newPlayerLasers = [...playerLasersDataRef.current];
      const newPlayerRockets = [...playerRocketsDataRef.current];
      const newEnemyLasers = [...enemyLasersDataRef.current];
      const newEnemyHP = { ...enemyHPRef.current };
      const newAsteroidHP = { ...asteroidHPRef.current };
      const newMineHP = { ...mineHPRef.current };
      let playerWasHit = false;
      let playerHPNow = playerHPRef.current;
      let enemiesKilledNow = 0;
      let asteroidsKilledNow = 0;
      let minesKilledNow = 0;

      // === СТОЛКНОВЕНИЯ: ЛАЗЕРЫ ИГРОКА ===
      for (let i = newPlayerLasers.length - 1; i >= 0; i--) {
        const laser = newPlayerLasers[i];
        // --- Босс ---
        if (bossDataRef.current.exists && bossDataRef.current.phase === 'active') {
          if (
            Math.abs(laser.x - bossDataRef.current.x) < BOSS_CONFIG.hitbox &&
            Math.abs(laser.y - bossDataRef.current.y) < BOSS_CONFIG.hitbox
          ) {
            setBossHP((prev) => Math.max(0, prev - 1));
            bossDataRef.current.hp = Math.max(0, bossDataRef.current.hp - 1);
            newPlayerLasers.splice(i, 1);

            // Если HP босса <= 0, запускаем фазу взрыва
            if (bossDataRef.current.hp <= 0) {
              setBossPhase('exploding');
              bossDataRef.current.phase = 'exploding';
            }
            continue;
          }
        }

        // Враги
        for (let j = 0; j < newEnemies.length; j++) {
          const enemy = newEnemies[j];
          if (Math.abs(laser.x - enemy.x) < PLAYER_HITBOX && Math.abs(laser.y - enemy.y) < PLAYER_HITBOX) {
            newEnemyHP[enemy.id] = (newEnemyHP[enemy.id] || 1) - 1;
            if (newEnemyHP[enemy.id] <= 0) {
              spawnExplosion(enemy.x, enemy.y, 'enemy');
              newEnemies.splice(j, 1);
              delete newEnemyHP[enemy.id];
              enemiesKilledNow++;
              setPtsEarned((prev) => prev + GAME_CONFIG.ENEMY_REWARD);
              playSound(GAME_CONFIG.SOUND_ENEMY_EXPLOSION, soundVolumes.enemyExplosion);
            } else {
              playSound(GAME_CONFIG.SOUND_ENEMY_HIT, soundVolumes.hitOnEnemy);
            }
            newPlayerLasers.splice(i, 1);
            // removePlayerLaserFromRef(laser.id); // remove from new refs system
            break;
          }
        }

        // Астероиды
        for (let j = 0; j < newAsteroids.length; j++) {
          const ast = newAsteroids[j];
          if (Math.abs(laser.x - ast.x) < ASTEROID_HITBOX && Math.abs(laser.y - ast.y) < ASTEROID_HITBOX) {
            newAsteroidHP[ast.id] = (newAsteroidHP[ast.id] || 1) - 1;
            if (newAsteroidHP[ast.id] <= 0) {
              spawnExplosion(ast.x, ast.y, 'asteroid');
              newAsteroids.splice(j, 1);
              delete newAsteroidHP[ast.id];
              asteroidsKilledNow++;
              setPtsEarned((prev) => prev + GAME_CONFIG.ASTEROID_REWARD);
              playSound(GAME_CONFIG.SOUND_ASTEROID_EXPLOSION, soundVolumes.asteroidExplosion);
            } else {
              playSound(GAME_CONFIG.SOUND_ENEMY_HIT, soundVolumes.hitOnEnemy);
            }
            newPlayerLasers.splice(i, 1);
            // removePlayerLaserFromRef(laser.id); // remove from new refs system
            break;
          }
        }

        // Мины
        for (let j = 0; j < newMines.length; j++) {
          const mine = newMines[j];
          if (Math.abs(laser.x - mine.x) < MINE_HITBOX && Math.abs(laser.y - mine.y) < MINE_HITBOX) {
            newMineHP[mine.id] = (newMineHP[mine.id] || 1) - 1;
            if (newMineHP[mine.id] <= 0) {
              spawnExplosion(mine.x, mine.y, 'mine');
              newMines.splice(j, 1);
              delete newMineHP[mine.id];
              minesKilledNow++;
              setPtsEarned((prev) => prev + GAME_CONFIG.MINE_REWARD);
              playSound(GAME_CONFIG.SOUND_MINE_EXPLOSION, soundVolumes.mineExplosion);
            }
            newPlayerLasers.splice(i, 1);
            // removePlayerLaserFromRef(laser.id); // remove from new refs system
            break;
          }
        }
      }

      // === СТОЛКНОВЕНИЯ: РАКЕТЫ ИГРОКА ===
      for (let i = newPlayerRockets.length - 1; i >= 0; i--) {
        const rocket = newPlayerRockets[i];
        let hit = false;
        // --- Босс ---
        if (bossDataRef.current.exists && bossDataRef.current.phase === 'active') {
          if (
            Math.abs(rocket.x - bossDataRef.current.x) < BOSS_CONFIG.hitbox &&
            Math.abs(rocket.y - bossDataRef.current.y) < BOSS_CONFIG.hitbox
          ) {
            setBossHP((prev) => Math.max(0, prev - 3));
            bossDataRef.current.hp = Math.max(0, bossDataRef.current.hp - 3);
            newPlayerRockets.splice(i, 1);

            // Если HP босса <= 0, запускаем фазу взрыва
            if (bossDataRef.current.hp <= 0) {
              setBossPhase('exploding');
              bossDataRef.current.phase = 'exploding';
            }
            continue;
          }
        }

        // Враги
        for (let j = 0; j < newEnemies.length; j++) {
          const enemy = newEnemies[j];
          if (Math.abs(rocket.x - enemy.x) < PLAYER_HITBOX && Math.abs(rocket.y - enemy.y) < PLAYER_HITBOX) {
            newEnemyHP[enemy.id] = (newEnemyHP[enemy.id] || 1) - 3;
            if (newEnemyHP[enemy.id] <= 0) {
              spawnExplosion(enemy.x, enemy.y, 'enemy');
              newEnemies.splice(j, 1);
              delete newEnemyHP[enemy.id];
              enemiesKilledNow++;
              setPtsEarned((prev) => prev + GAME_CONFIG.ENEMY_REWARD);
              playSound(GAME_CONFIG.SOUND_ENEMY_EXPLOSION, soundVolumes.enemyExplosion);
            } else {
              playSound(GAME_CONFIG.SOUND_ENEMY_HIT, soundVolumes.hitOnEnemy);
            }
            newPlayerRockets.splice(i, 1);
            hit = true;
            break;
          }
        }

        // Астероиды
        for (let j = 0; j < newAsteroids.length; j++) {
          const ast = newAsteroids[j];
          if (Math.abs(rocket.x - ast.x) < ASTEROID_HITBOX && Math.abs(rocket.y - ast.y) < ASTEROID_HITBOX) {
            spawnExplosion(ast.x, ast.y, 'asteroid');
            newAsteroids.splice(j, 1);
            delete newAsteroidHP[ast.id];
            asteroidsKilledNow++;
            setPtsEarned((prev) => prev + GAME_CONFIG.ASTEROID_REWARD);
            playSound(GAME_CONFIG.SOUND_ASTEROID_EXPLOSION, soundVolumes.asteroidExplosion);
            hit = true;
            break;
          }
        }

        // Мины
        for (let j = 0; j < newMines.length; j++) {
          const mine = newMines[j];
          if (Math.abs(rocket.x - mine.x) < MINE_HITBOX && Math.abs(rocket.y - mine.y) < MINE_HITBOX) {
            spawnExplosion(mine.x, mine.y, 'mine');
            newMines.splice(j, 1);
            delete newMineHP[mine.id];
            minesKilledNow++;
            setPtsEarned((prev) => prev + GAME_CONFIG.MINE_REWARD);
            playSound(GAME_CONFIG.SOUND_MINE_EXPLOSION, soundVolumes.mineExplosion);
            hit = true;
            break;
          }
        }
        if (hit) newPlayerRockets.splice(i, 1);
      }

      // === СТОЛКНОВЕНИЯ: ВРАГИ/АСТЕРОИДЫ/МИНЫ С ИГРОКОМ ===
      if (playerExists && playerHPNow > 0) {
        // Враги
        for (let i = newEnemies.length - 1; i >= 0; i--) {
          const enemy = newEnemies[i];
          if (
            Math.abs(enemy.x - playerXRef.current) < PLAYER_HITBOX + ENEMY_HITBOX &&
            Math.abs(enemy.y - playerYRef.current) < PLAYER_HITBOX + ENEMY_HITBOX
          ) {
            playerWasHit = true;
            playerHPNow = Math.max(0, playerHPNow - 1);
            spawnExplosion(enemy.x, enemy.y, 'enemy');
            newEnemies.splice(i, 1);
            delete newEnemyHP[enemy.id];
            enemiesKilledNow++;
            setPtsEarned((prev) => prev + GAME_CONFIG.ENEMY_REWARD);
            if (playerHPNow > 0) {
              playSound(GAME_CONFIG.SOUND_PLAYER_HIT, soundVolumes.hitOnPlayer);
            }
          }
        }

        // Астероиды
        for (let i = newAsteroids.length - 1; i >= 0; i--) {
          const ast = newAsteroids[i];
          if (
            Math.abs(ast.x - playerXRef.current) < PLAYER_HITBOX + ASTEROID_HITBOX &&
            Math.abs(ast.y - playerYRef.current) < PLAYER_HITBOX + ASTEROID_HITBOX
          ) {
            playerWasHit = true;
            playerHPNow = Math.max(0, playerHPNow - 1);
            spawnExplosion(ast.x, ast.y, 'asteroid');
            newAsteroids.splice(i, 1);
            delete newAsteroidHP[ast.id];
            asteroidsKilledNow++;
            setPtsEarned((prev) => prev + GAME_CONFIG.ASTEROID_REWARD);
            if (playerHPNow > 0) {
              playSound(GAME_CONFIG.SOUND_PLAYER_HIT, soundVolumes.hitOnPlayer);
            }
          }
        }

        // Мины
        for (let i = newMines.length - 1; i >= 0; i--) {
          const mine = newMines[i];
          if (
            Math.abs(mine.x - playerXRef.current) < PLAYER_HITBOX + MINE_HITBOX &&
            Math.abs(mine.y - playerYRef.current) < PLAYER_HITBOX + MINE_HITBOX
          ) {
            playerWasHit = true;
            playerHPNow = Math.max(0, playerHPNow - 1);
            spawnExplosion(mine.x, mine.y, 'mine');
            newMines.splice(i, 1);
            delete newMineHP[mine.id];
            minesKilledNow++;
            setPtsEarned((prev) => prev + GAME_CONFIG.MINE_REWARD);
            if (playerHPNow > 0) {
              playSound(GAME_CONFIG.SOUND_PLAYER_HIT, soundVolumes.hitOnPlayer);
            }
          }
        }

        // Лазеры врагов
        for (let i = newEnemyLasers.length - 1; i >= 0; i--) {
          const laser = newEnemyLasers[i];
          // --- Лазеры и ракеты босса ---
          if (laser.type === 'bossLaser') {
            if (
              Math.abs(laser.x - playerXRef.current) < PLAYER_HITBOX &&
              Math.abs(laser.y - playerYRef.current) < PLAYER_HITBOX
            ) {
              playerWasHit = true;
              playerHPNow = Math.max(0, playerHPNow - 1);
              newEnemyLasers.splice(i, 1);

              if (playerHPNow > 0) playSound(GAME_CONFIG.SOUND_PLAYER_HIT, soundVolumes.hitOnPlayer);

              continue;
            }
          } else if (laser.type === 'bossRocket') {
            if (
              Math.abs(laser.x - playerXRef.current) < PLAYER_HITBOX + 2 &&
              Math.abs(laser.y - playerYRef.current) < PLAYER_HITBOX + 2
            ) {
              playerWasHit = true;
              playerHPNow = Math.max(0, playerHPNow - 3);
              newEnemyLasers.splice(i, 1);
              playSound(BOSS_CONFIG.soundRocket, 0.9);
              continue;
            }
          } else if (laser.type === 'enemyLaser') {
            if (
              Math.abs(laser.x - playerXRef.current) < PLAYER_HITBOX &&
              Math.abs(laser.y - playerYRef.current) < PLAYER_HITBOX
            ) {
              playerWasHit = true;
              playerHPNow = Math.max(0, playerHPNow - 1);
              newEnemyLasers.splice(i, 1);
              if (playerHPNow > 0) {
                playSound(GAME_CONFIG.SOUND_PLAYER_HIT, soundVolumes.hitOnPlayer);
              }
            }
          }
        }
      }

      updateExplosionParticles();

      // === ОБНОВЛЯЕМ СОСТОЯНИЯ ===
      enemiesDataRef.current = newEnemies;
      asteroidsDataRef.current = newAsteroids;
      minesDataRef.current = newMines;
      playerLasersDataRef.current = newPlayerLasers;
      playerRocketsDataRef.current = newPlayerRockets;
      enemyLasersDataRef.current = newEnemyLasers;
      setEnemyHP(newEnemyHP);
      setAsteroidHP(newAsteroidHP);
      setMineHP(newMineHP);
      if (playerWasHit) setPlayerHP(playerHPNow);
      // === ВЗРЫВ ИГРОКА ПРИ СМЕРТИ ===
      if (playerWasHit && playerHPNow === 0 && playerExists) {
        // Визуальный и звуковой взрыв игрока
        spawnExplosion(playerXRef.current, playerYRef.current, 'player');
        setPlayerExists(false); // Скрываем игрока после взрыва
      }
      if (enemiesKilledNow) setEnemiesKilled((prev) => prev + enemiesKilledNow);
      if (asteroidsKilledNow) setAsteroidsKilled((prev) => prev + asteroidsKilledNow);
      if (minesKilledNow) setMinesKilled((prev) => prev + minesKilledNow);

      requestId = requestAnimationFrame(gameLoop);
    }

    requestId = requestAnimationFrame(gameLoop);

    return () => {
      cancelAnimationFrame(requestId);
    };
  }, []);

  // Форматирование времени для HUD
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Логирование монтирования/размонтирования компонента
  useEffect(() => {
    console.log('[InGameScreen] mounted');

    return () => {
      console.log('[InGameScreen] unmounted');
    };
  }, []);

  useEffect(() => {
    console.log(`[PTS] Total updated: ${ptsEarned}`);
  }, [ptsEarned]);

  // === КОНСТАНТЫ HITBOX (в процентах поля, как раньше) ===
  const PLAYER_HITBOX = GAME_CONFIG.PLAYER_HITBOX_SIZE; // Увеличен с 3.5 для соответствия размеру спрайта 56px
  const ENEMY_HITBOX = GAME_CONFIG.ENEMY_HITBOX_SIZE; // Увеличен с 3.0 для соответствия размеру спрайта 48px
  const ASTEROID_HITBOX = GAME_CONFIG.ASTEROID_HITBOX_SIZE; // Увеличен с 3.0 для соответствия размерам 20-48px
  const MINE_HITBOX = GAME_CONFIG.MINE_HITBOX_SIZE; // Увеличен с 2.5 для соответствия размеру спрайта 36px
  const BOOSTER_HITBOX = BOOSTER_CONFIG.hitboxSize;

  // Активация бустера (общая для подбора и кнопки)
  function activateBooster() {
    playSound(BOOSTER_CONFIG.soundActivate, soundVolumes.boosterActivate);
    setActiveBooster(true);
    // Ускоряем стрельбу (в два раза уменьшаем интервалы)
    setFireRateMultiplier(0.5);
    if (boosterTimeoutRef.current) clearTimeout(boosterTimeoutRef.current);
    boosterTimeoutRef.current = setTimeout(() => {
      setActiveBooster(false);
      setFireRateMultiplier(1);
    }, BOOSTER_CONFIG.effectDuration);
  }

  function handleActivateBoosterByButton() {
    if (activeBooster || activatedBoostersCount.current >= boosterCount) return;

    activatedBoostersCount.current += 1;
    activateBooster();
  }

  // Цвета снарядов из конфига
  const PLAYER_LASER_COLOR = GAME_CONFIG.PLAYER_LASER_COLOR;
  const PLAYER_LASER_COLOR_BOOST = GAME_CONFIG.PLAYER_LASER_COLOR_BOOST;
  const PLAYER_ROCKET_COLOR = GAME_CONFIG.PLAYER_ROCKET_COLOR;

  // === ЛОГИКА ПОЯВЛЕНИЯ БОССА ===
  useEffect(() => {
    if (showResults) {
      // После показа окна результатов — сброс состояния происходит через resetGameState
      return;
    }
    // Появление босса после таймера
    if (gameTime === 0 && playerExists && !bossExists) {
      setBoss((prev: any) => ({
        ...prev,
        y: BOSS_CONFIG.trajectory.Y_APPEAR,
        x0: (BOSS_CONFIG.trajectory.X_MIN + BOSS_CONFIG.trajectory.X_MAX) / 2, // центр по X
        y0: BOSS_CONFIG.trajectory.Y_APPEAR, // стартовая позиция по Y
        phaseX: 0,
        phaseY: 0,
        ampY: BOSS_CONFIG.trajectory.AMP_Y,
        born: Date.now(),
      }));
      setBossHP(params.boss?.bossHP || 30);
      setBossExists(true);
      setBossPhase('appearing'); // новая фаза появления
      // Проигрываем звук появления
      playSound(BOSS_CONFIG.soundAppear, GAME_CONFIG.VOLUME_BOSS_APPEAR);
    }
    // --- Больше не удаляем босса сразу после смерти игрока ---
    // if (gameTime === 0 && !playerExists && bossExists) {
    //   setBossExists(false);
    //   setBossPhase('idle');
    // }
  }, [gameTime, playerExists, bossExists, showResults]);

  // === ВЗРЫВ БОССА, ПОБЕДА, HUD ===
  // Победа после уничтожения босса: взрыв, задержка 2 сек, начисление PTS, показ Victory
  useEffect(() => {
    if (bossPhase === 'exploding' && boss && bossExists) {
      spawnExplosion(boss.x, boss.y, 'boss');
      playSound(BOSS_CONFIG.soundExplosion, 1);
      setTimeout(() => {
        setPtsEarned((prev) => prev + BOSS_CONFIG.reward);
        setIsVictory(true);
        setShowResults(true);
        setBossExists(false);
        setBossPhase('defeated');
        setBoss((prev: any) => ({ ...prev, y: 120 })); // Просто скрываем босса за пределами поля
      }, 2000);
    }
  }, [bossPhase, boss, bossExists]);

  return (
    <div className="fixed inset-0 min-h-screen w-full flex items-center justify-center">
      {/* Viewport 20:9 */}
      <div className="game-viewport relative flex flex-col h-full w-full overflow-hidden">
        <SpaceBackground variant="game" />

        {/* HUD и игровая зона */}
        <div className="relative z-10 flex flex-col h-full w-full p-4 font-['Orbitron']">
          {/* Верхний HUD: PTS и VARA */}
          <div className="flex justify-between items-center mb-4">
            <div className="text-cyan-400 font-bold text-lg glow-blue">PTS: {playerPTS}</div>
            {account && (
              <div className="text-gray-300 font-bold text-lg glow-white">
                {integerBalanceDisplay.value} {integerBalanceDisplay.unit}
              </div>
            )}
          </div>
          {/* Жизни, БУСТЕР и таймер */}
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-1">
              {[...Array(3)].map((_, i) => (
                <Heart
                  key={i}
                  className={`h-6 w-6 ${i < playerHP ? 'text-red-500 fill-red-500 glow-red' : 'text-gray-600'}`}
                />
              ))}
            </div>
            {/* Кнопка активации бустера */}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="p-1 h-8 w-8 text-yellow-400 border-2 border-yellow-400 glow-yellow-border hover:bg-yellow-500/10"
                onClick={handleActivateBoosterByButton}
                disabled={boosterCount === 0 || activeBooster}
                title="Activate Booster">
                <Zap className="h-5 w-5" />
              </Button>
              <span className="text-xl font-bold text-yellow-400 glow-yellow">x{boosterCount}</span>
            </div>
            <div className="text-cyan-400 font-bold text-xl glow-blue">{formatTime(gameTime)}</div>
          </div>
          {/* Игровая зона */}
          <div
            ref={gameAreaRef}
            id="game-area"
            className="flex-1 flex relative border border-cyan-500/30 rounded-lg overflow-hidden bg-black/20">
            {/* Корабль игрока */}
            {playerExists && playerHP > 0 && (
              <>
                <img
                  src={`/img/starship-${shipLevel}.png`}
                  alt="player"
                  width={PLAYER_SHIP_BASE_SIZE + PLAYER_SHIP_SIZE_STEP * (shipLevel - 1)}
                  height={PLAYER_SHIP_BASE_SIZE + PLAYER_SHIP_SIZE_STEP * (shipLevel - 1)}
                  draggable={false}
                  className="absolute select-none pointer-events-none"
                  style={{
                    width: `${PLAYER_SHIP_BASE_SIZE + PLAYER_SHIP_SIZE_STEP * (shipLevel - 1)}px`,
                    height: `${PLAYER_SHIP_BASE_SIZE + PLAYER_SHIP_SIZE_STEP * (shipLevel - 1)}px`,
                    transform: 'translateX(-50%)',
                    zIndex: 10,
                    userSelect: 'none',
                    opacity: 1,
                    background: 'none',
                    boxShadow: 'none',
                  }}
                  ref={playerImageRef}
                />
              </>
            )}

            <MobileControls
              onPointer={(arrowKey, isPressed, intensity = 1) => {
                pressedKeys.current[arrowKey] = isPressed;
                if (isPressed) {
                  trackpadIntensity.current[arrowKey] = intensity;
                } else {
                  delete trackpadIntensity.current[arrowKey];
                }
              }}
            />
          </div>

          <div className="absolute top-0 right-0 p-2 text-white bg-black">{fps}</div>
        </div>
      </div>

      {/* Экран результатов */}
      <ResultsScreen
        isOpen={showResults}
        onClose={onBackToMenu}
        onReplay={gamesAvailable > 1 ? onReplayGame : undefined}
        isVictory={isVictory}
        ptsEarned={ptsEarned}
        playerPTS={playerPTS}
        playerVARA={playerVARA}
        enemiesDefeated={enemiesKilled + asteroidsKilled + minesKilled}
        asteroidsKilled={asteroidsKilled}
        minesKilled={minesKilled}
        activatedBoostersCount={activatedBoostersCount.current}
      />
    </div>
  );
}
