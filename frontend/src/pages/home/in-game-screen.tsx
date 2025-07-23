/* eslint-disable react-hooks/exhaustive-deps */

/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Account } from '@gear-js/react-hooks';
import { Heart, Zap } from 'lucide-react';
import React, { useState, useEffect, useRef } from 'react';

import { Button } from '@/components/ui/button';

import { GAME_CONFIG, BOSS_CONFIG } from './game-config';
import { MobileControls } from './mobile-controls';
import { ResultsScreen } from './results-screen';
import { SpaceBackground } from './space-background';
import { useBackgroundMusic } from './use-background-music';
import { useFps } from './use-fps';
import { useGameTime } from './use-game-time';
import { usePlaySound } from './use-play-sound';

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
  const playerExists = playerHP > 0;

  const [showResults, setShowResults] = useState(false);
  const [isVictory, setIsVictory] = useState(true);
  const [ptsEarned, setPtsEarned] = useState(0);

  const [bossHP, setBossHP] = useState(0);
  const bossExists = bossHP > 0;

  const [bossPhase, setBossPhase] = useState<'idle' | 'active' | 'exploding' | 'defeated' | 'appearing'>('idle');
  const bossHPRef = useRef(bossHP);
  const bossPhaseRef = useRef(bossPhase);

  useEffect(() => {
    bossHPRef.current = bossHP;
  }, [bossHP]);
  useEffect(() => {
    bossPhaseRef.current = bossPhase;
  }, [bossPhase]);

  // Ограничения движения
  const X_MIN = 0;
  const X_MAX = 100;
  const Y_MIN = 5;
  const Y_MAX = 60;

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

  // Рефы для актуальных данных

  const enemyHPRef = useRef<{ [id: string]: number }>({});
  const asteroidHPRef = useRef<{ [id: string]: number }>({});
  const mineHPRef = useRef<{ [id: string]: number }>({});
  const playerHPRef = useRef(playerHP);
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
  useBackgroundMusic(!showResults);
  const playSound = usePlaySound();

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
      pressedKeys.current = {};
      trackpadIntensity.current = {};
      // should entities be cleared here? no need any changes for now
    }
  }, [showResults]);

  // Initialize canvas and load images
  useEffect(() => {
    if (canvasRef.current && !canvasContextRef.current) {
      canvasContextRef.current = canvasRef.current.getContext('2d');
    }

    // Load player image
    if (!playerImageElement.current) {
      const img = new Image();
      img.src = `/img/starship-${shipLevel}.png`;
      img.onload = () => {
        playerImageElement.current = img;
      };
    } else if (playerImageElement.current.src !== `/img/starship-${shipLevel}.png`) {
      // Reload image if ship level changed
      const img = new Image();
      img.src = `/img/starship-${shipLevel}.png`;
      img.onload = () => {
        playerImageElement.current = img;
      };
    }

    // Load asteroid image
    if (!asteroidImageElement.current) {
      const img = new Image();
      img.src = '/img/asteroid.png';
      img.onload = () => {
        asteroidImageElement.current = img;
      };
    }

    // Load mine image
    if (!mineImageElement.current) {
      const img = new Image();
      img.src = '/img/mine.png';
      img.onload = () => {
        mineImageElement.current = img;
      };
    }

    // Load booster image
    if (!boosterImageElement.current) {
      const img = new Image();
      img.src = '/img/booster.png';
      img.onload = () => {
        boosterImageElement.current = img;
      };
    }

    // Load enemy image
    if (!enemyImageElement.current) {
      const img = new Image();
      img.src = '/img/alien-ship.png';
      img.onload = () => {
        enemyImageElement.current = img;
      };
    }

    // Load boss image
    if (!bossImageElement.current) {
      const img = new Image();
      img.src = BOSS_CONFIG.img;
      img.onload = () => {
        bossImageElement.current = img;
      };
    }
  }, [shipLevel]);

  // Resize canvas to match game area
  useEffect(() => {
    const resizeCanvas = () => {
      if (canvasRef.current && gameAreaRef.current) {
        const gameArea = gameAreaRef.current;
        const rect = gameArea.getBoundingClientRect();
        canvasRef.current.width = rect.width;
        canvasRef.current.height = rect.height;
      }
    };

    resizeCanvas();

    const resizeObserver = new ResizeObserver(resizeCanvas);
    if (gameAreaRef.current) {
      resizeObserver.observe(gameAreaRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

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

  const clearCanvas = () => {
    if (!canvasContextRef.current || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvasContextRef.current;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const renderPlayer = () => {
    if (!canvasContextRef.current || !canvasRef.current || !playerImageElement.current) return;
    if (!playerExists || playerHP <= 0) return;

    const canvas = canvasRef.current;
    const ctx = canvasContextRef.current;

    // Calculate player size based on ship level
    const playerSize = PLAYER_SHIP_BASE_SIZE + PLAYER_SHIP_SIZE_STEP * (shipLevel - 1);

    // Convert percentage coordinates to canvas coordinates
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;

    // Player position in percentage (0-100), convert to canvas pixels
    const playerX = (playerPositionRef.current.x / 100) * canvasWidth;
    const playerY = canvasHeight - (playerPositionRef.current.y / 100) * canvasHeight; // Canvas Y is flipped

    // Draw the player image centered at the position
    ctx.drawImage(
      playerImageElement.current,
      playerX - playerSize / 2, // Center horizontally
      playerY - playerSize / 2, // Center vertically
      playerSize,
      playerSize,
    );
  };

  const playerLasersDataRef = useRef<{ id: string; x: number; y: number }[]>([]);
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasContextRef = useRef<CanvasRenderingContext2D | null>(null);
  const playerImageElement = useRef<HTMLImageElement | null>(null);
  const asteroidImageElement = useRef<HTMLImageElement | null>(null);
  const mineImageElement = useRef<HTMLImageElement | null>(null);
  const boosterImageElement = useRef<HTMLImageElement | null>(null);
  const enemyImageElement = useRef<HTMLImageElement | null>(null);
  const bossImageElement = useRef<HTMLImageElement | null>(null);

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
    if (!canvasContextRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvasContextRef.current;
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;

    // Clear existing laser areas (we'll track previous positions later if needed)
    // For now, we'll rely on the clear areas from other entities

    playerLasersDataRef.current.forEach((laser) => {
      // Convert percentage coordinates to canvas coordinates
      const laserX = (laser.x / 100) * canvasWidth;
      const laserY = canvasHeight - (laser.y / 100) * canvasHeight; // Canvas Y is flipped

      // Set laser color based on booster status
      const laserColor = activeBoosterRef.current ? PLAYER_LASER_COLOR_BOOST : PLAYER_LASER_COLOR;
      ctx.fillStyle = laserColor;

      // Draw laser as a rectangle
      ctx.fillRect(
        laserX - PLAYER_LASER_WIDTH / 2, // Center horizontally
        laserY - PLAYER_LASER_HEIGHT / 2, // Center vertically
        PLAYER_LASER_WIDTH,
        PLAYER_LASER_HEIGHT,
      );

      // Add glow effect (simplified)
      if (activeBoosterRef.current) {
        ctx.shadowColor = laserColor;
        ctx.shadowBlur = 10;
        ctx.fillRect(
          laserX - PLAYER_LASER_WIDTH / 2,
          laserY - PLAYER_LASER_HEIGHT / 2,
          PLAYER_LASER_WIDTH,
          PLAYER_LASER_HEIGHT,
        );
        ctx.shadowBlur = 0; // Reset shadow
      }
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
    if (!canvasContextRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvasContextRef.current;
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;

    playerRocketsDataRef.current.forEach((rocket) => {
      // Convert percentage coordinates to canvas coordinates
      const rocketX = (rocket.x / 100) * canvasWidth;
      const rocketY = canvasHeight - (rocket.y / 100) * canvasHeight; // Canvas Y is flipped

      // Set rocket color
      ctx.fillStyle = PLAYER_ROCKET_COLOR;

      // Draw rocket as a circle (simulating the rounded-full class)
      const radius = Math.min(PLAYER_ROCKET_WIDTH, PLAYER_ROCKET_HEIGHT) / 2;

      ctx.beginPath();
      ctx.arc(rocketX, rocketY, radius, 0, 2 * Math.PI);
      ctx.fill();

      // Add glow effect
      ctx.shadowColor = PLAYER_ROCKET_COLOR;
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(rocketX, rocketY, radius, 0, 2 * Math.PI);
      ctx.fill();
      ctx.shadowBlur = 0; // Reset shadow
    });
  };

  const asteroidsDataRef = useRef<
    { id: string; x: number; y: number; speed: number; rotation: number; rotationSpeed: number; size: number }[]
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
          size: ASTEROID_SIZE_MIN + Math.random() * (ASTEROID_SIZE_MAX - ASTEROID_SIZE_MIN),
        });

        // Initialize asteroid HP
        asteroidHPRef.current[id] = GAME_CONFIG.ASTEROID_BASE_HP;
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
    if (!canvasContextRef.current || !canvasRef.current || !asteroidImageElement.current) return;

    const canvas = canvasRef.current;
    const ctx = canvasContextRef.current;
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;

    asteroidsDataRef.current.forEach((asteroid) => {
      // Convert percentage coordinates to canvas coordinates
      const asteroidX = (asteroid.x / 100) * canvasWidth;
      const asteroidY = canvasHeight - (asteroid.y / 100) * canvasHeight; // Canvas Y is flipped

      // Save context for rotation
      ctx.save();

      // Move to asteroid position and rotate
      ctx.translate(asteroidX, asteroidY);
      ctx.rotate((asteroid.rotation * Math.PI) / 180);

      // Draw asteroid image centered at the position
      ctx.drawImage(
        asteroidImageElement.current!,
        -asteroid.size / 2, // Center horizontally
        -asteroid.size / 2, // Center vertically
        asteroid.size,
        asteroid.size,
      );

      // Restore context
      ctx.restore();
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

        // Initialize mine HP
        mineHPRef.current[id] = GAME_CONFIG.MINE_BASE_HP;
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
    if (!canvasContextRef.current || !canvasRef.current || !mineImageElement.current) return;

    const canvas = canvasRef.current;
    const ctx = canvasContextRef.current;
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;

    minesDataRef.current.forEach((mine) => {
      // Convert percentage coordinates to canvas coordinates
      const mineX = (mine.x / 100) * canvasWidth;
      const mineY = canvasHeight - (mine.y / 100) * canvasHeight; // Canvas Y is flipped

      // Draw mine image centered at the position
      ctx.drawImage(
        mineImageElement.current!,
        mineX - MINE_SIZE / 2, // Center horizontally
        mineY - MINE_SIZE / 2, // Center vertically
        MINE_SIZE,
        MINE_SIZE,
      );
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

            const dx = booster.x - playerPositionRef.current.x;
            const dy = booster.y - playerPositionRef.current.y;
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
    if (!canvasContextRef.current || !canvasRef.current || !boosterImageElement.current) return;

    const canvas = canvasRef.current;
    const ctx = canvasContextRef.current;
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;

    boostersDataRef.current.forEach((booster) => {
      // Convert percentage coordinates to canvas coordinates
      const boosterX = (booster.x / 100) * canvasWidth;
      const boosterY = canvasHeight - (booster.y / 100) * canvasHeight; // Canvas Y is flipped

      // Save context for rotation
      ctx.save();

      // Move to booster position and rotate
      ctx.translate(boosterX, boosterY);
      ctx.rotate((booster.rotation * Math.PI) / 180);

      // Draw booster image centered at the position
      ctx.drawImage(
        boosterImageElement.current!,
        -BOOSTER_CONFIG.size / 2, // Center horizontally
        -BOOSTER_CONFIG.size / 2, // Center vertically
        BOOSTER_CONFIG.size,
        BOOSTER_CONFIG.size,
      );

      // Restore context
      ctx.restore();
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

        // Initialize enemy HP
        enemyHPRef.current[id] = GAME_CONFIG.ENEMY_BASE_HP;
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
    if (!canvasContextRef.current || !canvasRef.current || !enemyImageElement.current) return;

    const canvas = canvasRef.current;
    const ctx = canvasContextRef.current;
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;

    enemiesDataRef.current.forEach((enemy) => {
      // Convert percentage coordinates to canvas coordinates
      const enemyX = (enemy.x / 100) * canvasWidth;
      const enemyY = canvasHeight - (enemy.y / 100) * canvasHeight; // Canvas Y is flipped

      // Draw enemy image centered at the position
      ctx.drawImage(
        enemyImageElement.current!,
        enemyX - ENEMY_SIZE / 2, // Center horizontally
        enemyY - ENEMY_SIZE / 2, // Center vertically
        ENEMY_SIZE,
        ENEMY_SIZE,
      );
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
    if (!canvasContextRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvasContextRef.current;
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;

    enemyLasersDataRef.current.forEach((laser) => {
      // Convert percentage coordinates to canvas coordinates
      const laserX = (laser.x / 100) * canvasWidth;
      const laserY = canvasHeight - (laser.y / 100) * canvasHeight; // Canvas Y is flipped

      // Handle different laser types
      if (laser.type === 'bossLaser') {
        // Boss laser
        ctx.fillStyle = BOSS_CONFIG.laserColor;

        // Add glow effect
        ctx.shadowColor = BOSS_CONFIG.laserColor;
        ctx.shadowBlur = 10;

        ctx.beginPath();
        ctx.arc(laserX, laserY, BOSS_CONFIG.laserWidth / 2, 0, 2 * Math.PI);
        ctx.fill();

        ctx.shadowBlur = 0; // Reset shadow
      } else if (laser.type === 'bossRocket') {
        // Boss rocket
        ctx.fillStyle = BOSS_CONFIG.rocketColor;

        // Add glow effect
        ctx.shadowColor = BOSS_CONFIG.rocketColor;
        ctx.shadowBlur = 8;

        ctx.beginPath();
        ctx.arc(laserX, laserY, BOSS_CONFIG.rocketWidth / 2, 0, 2 * Math.PI);
        ctx.fill();

        ctx.shadowBlur = 0; // Reset shadow
      } else {
        // Default enemy laser
        ctx.fillStyle = '#ff6b6b';

        // Add glow effect
        ctx.shadowColor = '#ff6b6b';
        ctx.shadowBlur = 10;

        ctx.beginPath();
        ctx.arc(laserX, laserY, ENEMY_LASER_WIDTH / 2, 0, 2 * Math.PI);
        ctx.fill();

        ctx.shadowBlur = 0; // Reset shadow
      }
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
    const bossData = bossDataRef.current;

    if (
      canvasContextRef.current &&
      canvasRef.current &&
      bossImageElement.current &&
      bossData.exists &&
      (bossData.phase === 'appearing' || bossData.phase === 'active')
    ) {
      const canvas = canvasRef.current;
      const ctx = canvasContextRef.current;
      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;

      // Convert percentage coordinates to canvas coordinates
      const bossX = (bossData.x / 100) * canvasWidth;
      const bossY = canvasHeight - (bossData.y / 100) * canvasHeight; // Canvas Y is flipped

      // Draw boss image centered at the position
      ctx.drawImage(
        bossImageElement.current,
        bossX - BOSS_CONFIG.size / 2, // Center horizontally
        bossY - BOSS_CONFIG.size / 2, // Center vertically
        BOSS_CONFIG.size,
        BOSS_CONFIG.size,
      );
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
    if (!canvasContextRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvasContextRef.current;
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;

    particlesDataRef.current.forEach((particle) => {
      // Convert percentage coordinates to canvas coordinates
      const particleX = (particle.x / 100) * canvasWidth;
      const particleY = canvasHeight - (particle.y / 100) * canvasHeight; // Canvas Y is flipped

      // Calculate opacity based on particle life
      const elapsedTime = Date.now() - particle.created;
      const lifeProgress = elapsedTime / particle.life;
      const opacity = Math.max(0, 1 - lifeProgress) * 0.7; // Base opacity is 0.7

      if (opacity <= 0) return; // Skip particles that are fully faded

      // Set particle color with opacity
      ctx.fillStyle = particle.color;
      ctx.globalAlpha = opacity;

      // Add glow effect
      ctx.shadowColor = particle.color;
      ctx.shadowBlur = 8;

      // Draw particle as a circle
      ctx.beginPath();
      ctx.arc(particleX, particleY, particle.size / 2, 0, 2 * Math.PI);
      ctx.fill();

      // Reset shadow and alpha
      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1;
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

      clearCanvas();
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
          if (Math.abs(laser.x - enemy.x) < ENEMY_HITBOX && Math.abs(laser.y - enemy.y) < ENEMY_HITBOX) {
            newEnemyHP[enemy.id] = newEnemyHP[enemy.id] - 1;
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
            break;
          }
        }

        // Астероиды
        for (let j = 0; j < newAsteroids.length; j++) {
          const ast = newAsteroids[j];
          if (Math.abs(laser.x - ast.x) < ASTEROID_HITBOX && Math.abs(laser.y - ast.y) < ASTEROID_HITBOX) {
            newAsteroidHP[ast.id] = newAsteroidHP[ast.id] - 1;
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
            break;
          }
        }

        // Мины
        for (let j = 0; j < newMines.length; j++) {
          const mine = newMines[j];
          if (Math.abs(laser.x - mine.x) < MINE_HITBOX && Math.abs(laser.y - mine.y) < MINE_HITBOX) {
            newMineHP[mine.id] = newMineHP[mine.id] - 1;
            if (newMineHP[mine.id] <= 0) {
              spawnExplosion(mine.x, mine.y, 'mine');
              newMines.splice(j, 1);
              delete newMineHP[mine.id];
              minesKilledNow++;
              setPtsEarned((prev) => prev + GAME_CONFIG.MINE_REWARD);
              playSound(GAME_CONFIG.SOUND_MINE_EXPLOSION, soundVolumes.mineExplosion);
            }
            newPlayerLasers.splice(i, 1);
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
            newEnemyHP[enemy.id] = newEnemyHP[enemy.id] - 3;
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
            Math.abs(enemy.x - playerPositionRef.current.x) < PLAYER_HITBOX + ENEMY_HITBOX &&
            Math.abs(enemy.y - playerPositionRef.current.y) < PLAYER_HITBOX + ENEMY_HITBOX
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
            Math.abs(ast.x - playerPositionRef.current.x) < PLAYER_HITBOX + ASTEROID_HITBOX &&
            Math.abs(ast.y - playerPositionRef.current.y) < PLAYER_HITBOX + ASTEROID_HITBOX
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
            Math.abs(mine.x - playerPositionRef.current.x) < PLAYER_HITBOX + MINE_HITBOX &&
            Math.abs(mine.y - playerPositionRef.current.y) < PLAYER_HITBOX + MINE_HITBOX
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
              Math.abs(laser.x - playerPositionRef.current.x) < PLAYER_HITBOX &&
              Math.abs(laser.y - playerPositionRef.current.y) < PLAYER_HITBOX
            ) {
              playerWasHit = true;
              playerHPNow = Math.max(0, playerHPNow - 1);
              newEnemyLasers.splice(i, 1);

              if (playerHPNow > 0) playSound(GAME_CONFIG.SOUND_PLAYER_HIT, soundVolumes.hitOnPlayer);

              continue;
            }
          } else if (laser.type === 'bossRocket') {
            if (
              Math.abs(laser.x - playerPositionRef.current.x) < PLAYER_HITBOX + 2 &&
              Math.abs(laser.y - playerPositionRef.current.y) < PLAYER_HITBOX + 2
            ) {
              playerWasHit = true;
              playerHPNow = Math.max(0, playerHPNow - 3);
              newEnemyLasers.splice(i, 1);
              playSound(BOSS_CONFIG.soundRocket, 0.9);
              continue;
            }
          } else if (laser.type === 'enemyLaser') {
            if (
              Math.abs(laser.x - playerPositionRef.current.x) < PLAYER_HITBOX &&
              Math.abs(laser.y - playerPositionRef.current.y) < PLAYER_HITBOX
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
      enemyHPRef.current = newEnemyHP;
      asteroidHPRef.current = newAsteroidHP;
      mineHPRef.current = newMineHP;

      if (playerWasHit) setPlayerHP(playerHPNow);

      if (playerWasHit && playerHPNow === 0 && playerExists) {
        spawnExplosion(playerPositionRef.current.x, playerPositionRef.current.y, 'player');
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
      bossDataRef.current = {
        ...bossDataRef.current,
        y: BOSS_CONFIG.trajectory.Y_APPEAR,
        x0: (BOSS_CONFIG.trajectory.X_MIN + BOSS_CONFIG.trajectory.X_MAX) / 2, // центр по X
        y0: BOSS_CONFIG.trajectory.Y_APPEAR, // стартовая позиция по Y
        phaseX: 0,
        phaseY: 0,
        ampY: BOSS_CONFIG.trajectory.AMP_Y,
        born: Date.now(),
      };

      setBossHP(params.boss?.bossHP || 30);
      setBossPhase('appearing');
      playSound(BOSS_CONFIG.soundAppear, GAME_CONFIG.VOLUME_BOSS_APPEAR);
    }
  }, [gameTime, playerExists, bossExists, showResults]);

  // === ВЗРЫВ БОССА, ПОБЕДА, HUD ===
  // Победа после уничтожения босса: взрыв, задержка 2 сек, начисление PTS, показ Victory
  useEffect(() => {
    if (bossPhase === 'exploding' && bossDataRef.current && bossExists) {
      spawnExplosion(bossDataRef.current.x, bossDataRef.current.y, 'boss');
      playSound(BOSS_CONFIG.soundExplosion, 1);

      setTimeout(() => {
        setPtsEarned((prev) => prev + BOSS_CONFIG.reward);
        setIsVictory(true);
        setShowResults(true);
        setBossPhase('defeated');
      }, 2000);
    }
  }, [bossPhase, bossExists]);

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
            <canvas
              ref={canvasRef}
              className="absolute top-0 left-0 w-full h-full pointer-events-none"
              style={{ zIndex: 10 }}
            />

            {bossPhase === 'active' && (
              <div className="absolute left-1/2 top-2 -translate-x-1/2 z-50 flex flex-col items-center">
                <div className="w-48 h-3 bg-gray-800 rounded-full border border-yellow-400 mt-1 mb-1 flex items-center relative">
                  <div
                    className="h-3 rounded-full bg-gradient-to-r from-yellow-300 to-red-500 absolute left-0 top-0"
                    style={{
                      width: `${(bossHP / (params.boss?.bossHP || 30)) * 100}%`,
                      transition: 'width 0.2s',
                      zIndex: 1,
                    }}
                  />
                  <span
                    className="absolute w-full text-center text-yellow-300 font-bold text-xs tracking-widest uppercase drop-shadow-lg"
                    style={{ fontSize: '13px', letterSpacing: '2px', zIndex: 2 }}>
                    Mothership
                  </span>
                </div>
              </div>
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
        playerVARA={0}
        enemiesDefeated={enemiesKilled + asteroidsKilled + minesKilled}
        asteroidsKilled={asteroidsKilled}
        minesKilled={minesKilled}
        activatedBoostersCount={activatedBoostersCount.current}
      />
    </div>
  );
}
