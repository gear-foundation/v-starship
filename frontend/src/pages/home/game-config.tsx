import { GameConfig, GameBGConfig, BoosterConfig, ShipLevel } from './game-config.types';

// === КОНФИГ ДЛЯ ГЕНЕРАЦИИ ФОНА ИГРОВОГО ЭКРАНА ===
export const GAME_BG_CONFIG: GameBGConfig = {
  starCount: { min: 20, max: 36 },
  starSize: { min: 1.5, max: 4.5 },
  starColors: [
    '#fff',
    '#b9eaff',
    '#ffe7b9',
    '#ffd6fa',
    '#b9ffd6',
    '#ffe6e6',
    '#b9c9ff',
    '#fff7b9',
    '#b9fff7',
    '#ffb9b9',
  ],
  planetCount: { min: 1, max: 2 },
  planetSize: { min: 36, max: 80 },
  planetColors: [
    ['#4f8cff', '#a6bfff'],
    ['#ffb347', '#ffcc80'],
    ['#b388ff', '#e1bee7'],
    ['#ff80ab', '#ffb6b9'],
    ['#00e6e6', '#b2fefa'],
    ['#ff8a65', '#ffd180'],
  ],
  planetOpacity: { min: 0.18, max: 0.45 },
  nebulaCount: { min: 1, max: 2 },
  nebulaSize: { min: 100, max: 180 },
  nebulaColors: [
    ['#a78bfa', '#f0abfc'],
    ['#38bdf8', '#818cf8'],
    ['#f472b6', '#f9a8d4'],
    ['#facc15', '#fde68a'],
    ['#34d399', '#6ee7b7'],
  ],
  nebulaOpacity: { min: 0.08, max: 0.18 },
  fieldColors: [
    'linear-gradient(180deg, #0a0a2a 0%, #1e1b4b 100%)',
    'linear-gradient(180deg, #0a0a2a 0%, #312e81 100%)',
    'linear-gradient(180deg, #0a0a2a 0%, #2e1065 100%)',
    'linear-gradient(180deg, #0a0a2a 0%, #0f172a 100%)',
    'linear-gradient(180deg, #0a0a2a 0%, #334155 100%)',
  ],
};

// === КОНФИГ ДЛЯ БУСТЕРОВ ===
export const BOOSTER_CONFIG: BoosterConfig = {
  countPerGame: 2,
  appearTimeRange: [10, 50],
  speed: 20,
  size: 48,
  rotationSpeed: 0.7,
  effectDuration: 7000, // 7 секунд
  icon: '/img/booster.png',
  soundActivate: '/sound/booster-activate.mp3',
  hitboxSize: 4.5, // Явный размер хитбокса бустера (в % игрового поля)
};

// === ПАРАМЕТРЫ КОРАБЛЯ ПО УРОВНЯМ ===

export const SHIP_LEVELS: ShipLevel[] = [
  {
    lasers: 0,
    laserRate: 0,
    rockets: 0,
    rocketRate: 0,
    enemyInterval: 0,
    asteroidInterval: 0,
    mineInterval: 0,
    boss: { laserCount: 0, laserRate: 0, rocketCount: 0, rocketRate: 0, bossHP: 0 },
  },
  {
    lasers: 1,
    laserRate: 500,
    rockets: 1,
    rocketRate: 2000,
    enemyInterval: 3500,
    asteroidInterval: 3300,
    mineInterval: 3700,
    boss: { laserCount: 1, laserRate: 900, rocketCount: 0, rocketRate: 0, bossHP: 30 },
  },
  {
    lasers: 1,
    laserRate: 400,
    rockets: 1,
    rocketRate: 1600,
    enemyInterval: 3000,
    asteroidInterval: 2800,
    mineInterval: 3200,
    boss: { laserCount: 1, laserRate: 850, rocketCount: 1, rocketRate: 1600, bossHP: 40 },
  },
  {
    lasers: 2,
    laserRate: 400,
    rockets: 1,
    rocketRate: 1500,
    enemyInterval: 2500,
    asteroidInterval: 2400,
    mineInterval: 2800,
    boss: { laserCount: 1, laserRate: 800, rocketCount: 1, rocketRate: 1500, bossHP: 50 },
  },
  {
    lasers: 2,
    laserRate: 320,
    rockets: 1,
    rocketRate: 1300,
    enemyInterval: 2200,
    asteroidInterval: 2100,
    mineInterval: 2600,
    boss: { laserCount: 2, laserRate: 800, rocketCount: 1, rocketRate: 1400, bossHP: 60 },
  },
  {
    lasers: 2,
    laserRate: 280,
    rockets: 1,
    rocketRate: 1100,
    enemyInterval: 2000,
    asteroidInterval: 1900,
    mineInterval: 2400,
    boss: { laserCount: 2, laserRate: 750, rocketCount: 1, rocketRate: 1300, bossHP: 70 },
  },
  {
    lasers: 3,
    laserRate: 260,
    rockets: 2,
    rocketRate: 1000,
    enemyInterval: 1800,
    asteroidInterval: 1700,
    mineInterval: 2200,
    boss: { laserCount: 2, laserRate: 700, rocketCount: 2, rocketRate: 1200, bossHP: 80 },
  },
  {
    lasers: 3,
    laserRate: 240,
    rockets: 2,
    rocketRate: 950,
    enemyInterval: 1600,
    asteroidInterval: 1500,
    mineInterval: 2000,
    boss: { laserCount: 2, laserRate: 650, rocketCount: 2, rocketRate: 1100, bossHP: 90 },
  },
  {
    lasers: 3,
    laserRate: 220,
    rockets: 2,
    rocketRate: 900,
    enemyInterval: 1400,
    asteroidInterval: 1300,
    mineInterval: 1800,
    boss: { laserCount: 2, laserRate: 600, rocketCount: 2, rocketRate: 1000, bossHP: 100 },
  },
  {
    lasers: 4,
    laserRate: 200,
    rockets: 2,
    rocketRate: 850,
    enemyInterval: 1200,
    asteroidInterval: 1100,
    mineInterval: 1700,
    boss: { laserCount: 2, laserRate: 550, rocketCount: 2, rocketRate: 900, bossHP: 110 },
  },
  {
    lasers: 4,
    laserRate: 180,
    rockets: 2,
    rocketRate: 800,
    enemyInterval: 1000,
    asteroidInterval: 1000,
    mineInterval: 1600,
    boss: { laserCount: 2, laserRate: 500, rocketCount: 2, rocketRate: 800, bossHP: 120 },
  },
];

// === ГЛОБАЛЬНЫЙ КОНФИГ БОССА ===
export const BOSS_CONFIG = {
  speed: 12, // %/сек
  size: 96,
  hitbox: 7.0,
  reward: 1000,
  img: '/img/mothership.png',
  soundLaser: '/sound/boss-laser.mp3',
  soundRocket: '/sound/boss-rocket.mp3',
  soundExplosion: '/sound/boss-explosion.mp3',
  soundAppear: '/sound/boss-raise.mp3', // Звук появления босса
  // ---  параметры визуала снарядов босса ---
  laserWidth: 4, // px (увеличиваем для теста)
  laserHeight: 14, // px (увеличиваем для теста)
  laserColor: '#00FF84', // Яркий зеленый цвет для лазера босса
  rocketWidth: 5, // px (увеличиваем для теста)
  rocketHeight: 16, // px (увеличиваем для теста)
  rocketColor: '#FF7700', // Яркий красный цвет для ракеты босса
  rocketBorder: '1px solid #fff',
  // ---  параметры скорости снарядов босса ---
  laserSpeed: 1.6, // %/тик (ускоренный лазер босса)
  rocketSpeed: 1.2, // %/тик (скорость ракеты босса)
  // --- параметры траектории и появления ---
  trajectory: {
    X_MIN: 10, // Минимальное положение по X (% ширины поля)
    X_MAX: 90, // Максимальное положение по X (% ширины поля)
    Y_APPEAR: -20, // Y, откуда появляется босс (вне поля)
    Y_TARGET: 80, // Y, до куда выплывает босс (рабочая позиция)
    AMP_X: 30, // Амплитуда синусоиды по X
    PHASE_X: 0, // Фаза синусоиды по X
    AMP_Y: 10, // Амплитуда синусоиды по Y
    PHASE_Y: 0, // Фаза синусоиды по Y
    SIN_FREQ: 0.7, // Частота синусоиды
    APPEAR_SPEED: 40, // Скорость выплывания (процентов в сек)
  },
};

// === ОСНОВНАЯ КОНФИГУРАЦИЯ ИГРЫ ===
export const GAME_CONFIG: GameConfig = {
  // Игровые параметры
  GAME_DURATION_MS: 60000, // 1 минута
  INITIAL_PLAYER_HP: 3,
  ENEMY_BASE_HP: 3, // HP обычного врага
  ASTEROID_BASE_HP: 3, // HP астероида
  MINE_BASE_HP: 1, // HP мины
  PLAYER_HITBOX_SIZE: 4.5,
  ENEMY_HITBOX_SIZE: 4.5,
  ASTEROID_HITBOX_SIZE: 5.0,
  MINE_HITBOX_SIZE: 4,

  // Ограничения движения игрока
  PLAYER_X_MIN: 0,
  PLAYER_X_MAX: 100,
  PLAYER_Y_MIN: 5,
  PLAYER_Y_MAX: 60,

  // Параметры движения
  PLAYER_ACCEL_X: 1,
  PLAYER_ACCEL_Y: 1,
  PLAYER_MAX_SPEED_X: 2.6,
  PLAYER_MAX_SPEED_Y: 1.6,
  PLAYER_FRICTION_X: 0.5,
  PLAYER_FRICTION_Y: 0.5,
  ENEMY_LASER_SPEED: 1.6,
  PLAYER_LASER_SPEED: 2, // %/тик (скорость лазера игрока)
  PLAYER_ROCKET_SPEED: 1.8, // %/тик (скорость ракеты игрока)

  // Награды
  ENEMY_REWARD: 50,
  ASTEROID_REWARD: 30,
  MINE_REWARD: 20,

  // Размеры
  PLAYER_SHIP_BASE_SIZE: 56,
  PLAYER_SHIP_SIZE_STEP: 2,
  ENEMY_SIZE: 48,
  ASTEROID_SIZE_MIN: 24,
  ASTEROID_SIZE_MAX: 48,
  MINE_SIZE: 32,
  PLAYER_LASER_WIDTH: 3,
  PLAYER_LASER_HEIGHT: 10,
  PLAYER_ROCKET_WIDTH: 5, // Увеличиваем ширину для теста
  PLAYER_ROCKET_HEIGHT: 15, // Увеличиваем высоту для теста
  ENEMY_LASER_WIDTH: 4, // Увеличиваем ширину для теста
  ENEMY_LASER_HEIGHT: 12, // Увеличиваем высоту для теста

  // Скорости
  MINE_SPEED: 23,
  ASTEROID_SPEED_MIN: 30,
  ASTEROID_SPEED_MAX: 45,
  ASTEROID_ROTATION_SPEED_MIN: 50, // Минимальная скорость вращения астероида (град/сек)
  ASTEROID_ROTATION_SPEED_MAX: 150, // Максимальная скорость вращения астероида (град/сек)
  BACKGROUND_SCROLL_SPEED: 5.6, // seconds to go from top to bottom

  // Звуки
  SOUND_PLAYER_LASER: '/sound/player-laser.mp3',
  SOUND_PLAYER_ROCKET: '/sound/player-rocket.mp3',
  SOUND_PLAYER_EXPLOSION: '/sound/player-explosion.mp3',
  SOUND_PLAYER_HIT: '/sound/hit-on-player.mp3',
  SOUND_ENEMY_LASER: '/sound/enemy-laser.mp3',
  SOUND_ENEMY_EXPLOSION: '/sound/enemy-explosion.mp3',
  SOUND_ENEMY_HIT: '/sound/hit-on-enemy.mp3',
  SOUND_ASTEROID_EXPLOSION: '/sound/asteroid-explosion.mp3',
  SOUND_MINE_EXPLOSION: '/sound/mine-explosion.mp3',
  SOUND_BG_MUSIC: '/sound/bg-music.mp3',
  SOUND_VICTORY: '/sound/victory.mp3',
  SOUND_GAME_PURCHASE: '/sound/game-purchase.mp3',
  SOUND_SHIP_LEVEL_UP: '/sound/ship-level-up.mp3',

  // Громкость звуков
  VOLUME_PLAYER_LASER: 0.3,
  VOLUME_PLAYER_ROCKET: 0.5,
  VOLUME_PLAYER_EXPLOSION: 0.5,
  VOLUME_PLAYER_HIT: 0.4,
  VOLUME_ENEMY_LASER: 0.5,
  VOLUME_ENEMY_EXPLOSION: 0.4,
  VOLUME_ENEMY_HIT: 0.3,
  VOLUME_ASTEROID_EXPLOSION: 0.5,
  VOLUME_MINE_EXPLOSION: 0.6,
  VOLUME_BG_MUSIC: 0.8,
  VOLUME_BOOSTER_ACTIVATE: 0.2,
  VOLUME_BOOSTER_DEACTIVATE: 0.5,
  VOLUME_VICTORY: 1,
  VOLUME_GAME_PURCHASE: 0.6,
  VOLUME_SHIP_LEVEL_UP: 0.8,
  VOLUME_BOSS_APPEAR: 0.8, // Громкость звука появления босса

  // Цвета снарядов
  PLAYER_LASER_COLOR: '#0ff',
  PLAYER_LASER_COLOR_BOOST: '#ff9900',
  PLAYER_ROCKET_COLOR: '#FF7700', // bg-yellow-400
  ENEMY_LASER_COLOR: '#00FF84', // bg-red-500
  // Удаляю строку ENEMY_ROCKET_COLOR: '#00bcd4', // Цвет ракет врага

  // Конфигурации подсистем
  GAME_BG_CONFIG,
  BOOSTER_CONFIG,
  SHIP_LEVELS,
  ENEMY_SPEED_MIN: 10,
  ENEMY_SPEED_MAX: 20,
  // === Параметры траектории движения врагов ===
  ENEMY_TRAJECTORY_CONFIG: {
    X0_MIN: 10, // Минимальное стартовое положение врага по X (% ширины поля)
    X0_MAX: 90, // Максимальное стартовое положение врага по X (% ширины поля)
    AMP_X_MIN: 0, // Минимальная амплитуда синусоиды по X (плавность траектории)
    AMP_X_MAX: 33, // Максимальная амплитуда синусоиды по X (% ширины поля)
    PHASE_X_MIN: 0, // Минимальная фаза синусоиды по X (смещение начала)
    PHASE_X_MAX: Math.PI * 2, // Максимальная фаза синусоиды по X
    AMP_Y_MIN: 70, // Минимальная амплитуда синусоиды по Y (вертикальные колебания)
    AMP_Y_MAX: 90, // Максимальная амплитуда синусоиды по Y (% высоты поля)
    PHASE_Y_MIN: 0, // Минимальная фаза синусоиды по Y
    PHASE_Y_MAX: Math.PI * 2, // Максимальная фаза синусоиды по Y
    SIN_FREQ: 0.9, // Частота синусоиды (чем больше, тем быстрее колебания)
  },
  ENEMY_FIRE_Y_MIN: 60, // Минимальное значение Y (в %), при котором враг может стрелять
  // === Свечение (boxShadow) для снарядов ===
  PLAYER_LASER_GLOW: '0 0 6px 2px #44e8fa', // Свечение лазера игрока
  PLAYER_LASER_GLOW_BOOST: '0 0 8px 2px #ff9100', // Свечение лазера игрока с бустером
  PLAYER_ROCKET_GLOW: '0 0 10px 2px #fff', // Свечение ракеты игрока
  ENEMY_LASER_GLOW: '0 0 6px 1px #00e5ff', // Свечение лазера врага
  ENEMY_ROCKET_GLOW: '0 0 12px 3px #00bcd4', // Свечение ракеты врага
  BOSS_LASER_GLOW: '0 0 10px 3px #00FF84', // Свечение лазера босса (зеленое)
  BOSS_ROCKET_GLOW: '0 0 14px 6px #ff7373', // Свечение ракеты босса (красное)
};
