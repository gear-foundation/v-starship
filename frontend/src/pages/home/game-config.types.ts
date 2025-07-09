// Конфигурация фона
export interface GameBGConfig {
  starCount: { min: number; max: number };
  starSize: { min: number; max: number };
  starColors: string[];
  starTwinkle: { min: number; max: number };
  planetCount: { min: number; max: number };
  planetSize: { min: number; max: number };
  planetColors: [string, string][];
  planetOpacity: { min: number; max: number };
  nebulaCount: { min: number; max: number };
  nebulaSize: { min: number; max: number };
  nebulaColors: [string, string][];
  nebulaOpacity: { min: number; max: number };
  fieldColors: string[];
}

// Конфигурация бустеров
export interface BoosterConfig {
  countPerGame: number;
  appearTimeRange: [number, number];
  speed: number;
  size: number;
  rotationSpeed: number;
  effectDuration: number;
  icon: string;
  soundActivate: string;
  hitboxSize: number; // Явный размер хитбокса бустера (в % игрового поля)
  soundDeactivate?: string;
}

// Параметры корабля для каждого уровня
export interface ShipLevel {
  lasers: number;
  laserRate: number;
  rockets: number;
  rocketRate: number;
  enemyInterval: number;
  asteroidInterval: number;
  mineInterval: number;
  // === Параметры босса для этого уровня ===
  boss?: BossLevelConfig;
}

// Конфиг для параметров босса на уровне
export interface BossLevelConfig {
  laserCount: number; // Сколько лазеров за выстрел
  laserRate: number; // Интервал между залпами лазеров (мс)
  rocketCount: number; // Сколько ракет за выстрел
  rocketRate: number; // Интервал между залпами ракет (мс)
  bossHP: number; // HP босса для этого уровня
}

// Глобальный конфиг босса (не зависит от уровня)
export interface BossConfig {
  HP: number;
  speed: number;
  size: number;
  hitbox: number;
  reward: number;
  img: string;
  soundLaser: string;
  soundRocket: string;
  soundExplosion: string;
  soundAppear: string; // Звук появления босса
  laserWidth: number;
  laserHeight: number;
  laserColor: string;
  rocketWidth: number;
  rocketHeight: number;
  rocketColor: string;
  rocketBorder: string;
  laserSpeed: number;
  rocketSpeed: number;
  trajectory: BossTrajectoryConfig; // Параметры траектории
}

// === Параметры траектории движения врагов ===
export interface EnemyTrajectoryConfig {
  X0_MIN: number; // Минимальное стартовое положение врага по X (% ширины поля)
  X0_MAX: number; // Максимальное стартовое положение врага по X (% ширины поля)
  AMP_X_MIN: number; // Минимальная амплитуда синусоиды по X (плавность траектории)
  AMP_X_MAX: number; // Максимальная амплитуда синусоиды по X (% ширины поля)
  PHASE_X_MIN: number; // Минимальная фаза синусоиды по X (смещение начала)
  PHASE_X_MAX: number; // Максимальная фаза синусоиды по X
  AMP_Y_MIN: number; // Минимальная амплитуда синусоиды по Y (вертикальные колебания)
  AMP_Y_MAX: number; // Максимальная амплитуда синусоиды по Y (% высоты поля)
  PHASE_Y_MIN: number; // Минимальная фаза синусоиды по Y
  PHASE_Y_MAX: number; // Максимальная фаза синусоиды по Y
  SIN_FREQ: number; // Частота синусоиды (чем больше, тем быстрее колебания)
}

// === Параметры траектории движения босса ===
export interface BossTrajectoryConfig {
  X_MIN: number; // Минимальное положение по X (% ширины поля)
  X_MAX: number; // Максимальное положение по X (% ширины поля)
  Y_APPEAR: number; // Y, откуда появляется босс (обычно < 0, вне поля)
  Y_TARGET: number; // Y, до куда выплывает босс (рабочая позиция)
  AMP_X: number; // Амплитуда синусоиды по X
  PHASE_X: number; // Фаза синусоиды по X
  AMP_Y: number; // Амплитуда синусоиды по Y
  PHASE_Y: number; // Фаза синусоиды по Y
  SIN_FREQ: number; // Частота синусоиды
  APPEAR_SPEED: number; // Скорость выплывания (процентов в сек)
}

// Общая конфигурация игры
export interface GameConfig {
  // Игровые параметры
  GAME_DURATION: number; // сек
  INITIAL_PLAYER_HP: number;
  /**
   * Базовое количество HP (жизней) для обычных врагов
   * Рекомендуется >=1, влияет на сложность уничтожения врага
   */
  ENEMY_BASE_HP: number;
  /**
   * Базовое количество HP (жизней) для астероидов
   * Рекомендуется >=1, влияет на сложность уничтожения астероида
   */
  ASTEROID_BASE_HP: number;
  /**
   * Базовое количество HP (жизней) для мин
   * Рекомендуется >=1, обычно 1 (мгновенное уничтожение)
   */
  MINE_BASE_HP: number;
  PLAYER_HITBOX_SIZE: number; // % от размера игрового поля
  ENEMY_HITBOX_SIZE: number; // % от размера игрового поля
  ASTEROID_HITBOX_SIZE: number; // % от размера игрового поля
  MINE_HITBOX_SIZE: number; // % от размера игрового поля

  // Ограничения движения игрока
  PLAYER_X_MIN: number; // % от ширины поля
  PLAYER_X_MAX: number; // % от ширины поля
  PLAYER_Y_MIN: number; // % от высоты поля
  PLAYER_Y_MAX: number; // % от высоты поля

  // Параметры движения
  PLAYER_ACCEL_X: number; // %/тик
  PLAYER_ACCEL_Y: number; // %/тик
  PLAYER_MAX_SPEED_X: number; // %/тик
  PLAYER_MAX_SPEED_Y: number; // %/тик
  PLAYER_FRICTION_X: number; // коэффициент замедления
  PLAYER_FRICTION_Y: number; // коэффициент замедления
  ENEMY_LASER_SPEED: number; // %/тик
  PLAYER_LASER_SPEED: number; // %/тик (скорость лазера игрока)
  PLAYER_ROCKET_SPEED: number; // %/тик (скорость ракеты игрока)

  // Награды
  ENEMY_REWARD: number; // PTS
  ASTEROID_REWARD: number; // PTS
  MINE_REWARD: number; // PTS

  // Размеры
  PLAYER_SHIP_BASE_SIZE: number; // px
  PLAYER_SHIP_SIZE_STEP: number; // px
  ENEMY_SIZE: number; // px
  ASTEROID_SIZE_MIN: number; // px
  ASTEROID_SIZE_MAX: number; // px
  MINE_SIZE: number; // px
  PLAYER_LASER_WIDTH: number; // px
  PLAYER_LASER_HEIGHT: number; // px
  PLAYER_ROCKET_WIDTH: number; // px
  PLAYER_ROCKET_HEIGHT: number; // px
  ENEMY_LASER_WIDTH: number; // px
  ENEMY_LASER_HEIGHT: number; // px

  // Скорости
  MINE_SPEED: number; // %/тик
  ASTEROID_SPEED_MIN: number; // %/тик
  ASTEROID_SPEED_MAX: number; // %/тик
  BACKGROUND_SCROLL_SPEED: number; // %/сек

  // Звуки
  SOUND_PLAYER_LASER: string;
  SOUND_PLAYER_ROCKET: string;
  SOUND_PLAYER_EXPLOSION: string;
  SOUND_PLAYER_HIT: string;
  SOUND_ENEMY_LASER: string;
  SOUND_ENEMY_EXPLOSION: string;
  SOUND_ENEMY_HIT: string;
  SOUND_ASTEROID_EXPLOSION: string;
  SOUND_MINE_EXPLOSION: string;
  SOUND_BG_MUSIC: string;
  SOUND_VICTORY: string;
  SOUND_GAME_PURCHASE: string;
  SOUND_SHIP_LEVEL_UP: string;

  // Громкость звуков
  VOLUME_PLAYER_LASER: number;
  VOLUME_PLAYER_ROCKET: number;
  VOLUME_PLAYER_EXPLOSION: number;
  VOLUME_PLAYER_HIT: number;
  VOLUME_ENEMY_LASER: number;
  VOLUME_ENEMY_EXPLOSION: number;
  VOLUME_ENEMY_HIT: number;
  VOLUME_ASTEROID_EXPLOSION: number;
  VOLUME_MINE_EXPLOSION: number;
  VOLUME_BG_MUSIC: number;
  VOLUME_BOOSTER_ACTIVATE: number;
  VOLUME_BOOSTER_DEACTIVATE: number;
  VOLUME_VICTORY: number;
  VOLUME_GAME_PURCHASE: number;
  VOLUME_SHIP_LEVEL_UP: number;
  VOLUME_BOSS_APPEAR: number; // Громкость звука появления босса

  // Конфигурации подсистем
  GAME_BG_CONFIG: GameBGConfig;
  BOOSTER_CONFIG: BoosterConfig;
  SHIP_LEVELS: [Record<string, never>, ...ShipLevel[]]; // [0-10], 0 - пустой объект

  // Цвета снарядов
  PLAYER_LASER_COLOR: string;
  PLAYER_LASER_COLOR_BOOST: string;
  PLAYER_ROCKET_COLOR: string;
  ENEMY_LASER_COLOR: string;
  BOSS_LASER_GLOW: string; // Свечение лазера босса
  BOSS_ROCKET_GLOW: string; // Свечение ракеты босса

  ENEMY_SPEED_MIN: number;
  ENEMY_SPEED_MAX: number;
  ASTEROID_ROTATION_SPEED_MIN: number; // Минимальная скорость вращения астероида (град/сек)
  ASTEROID_ROTATION_SPEED_MAX: number; // Максимальная скорость вращения астероида (град/сек)
  ENEMY_TRAJECTORY_CONFIG: EnemyTrajectoryConfig; // Параметры траектории врагов
  ENEMY_FIRE_Y_MIN: number; // Минимальное значение Y (в %), при котором враг может стрелять
  // === Свечение (boxShadow) для снарядов ===
  PLAYER_LASER_GLOW: string; // Свечение лазера игрока
  PLAYER_LASER_GLOW_BOOST: string; // Свечение лазера игрока с бустером
  PLAYER_ROCKET_GLOW: string; // Свечение ракеты игрока
  ENEMY_LASER_GLOW: string; // Свечение лазера врага
  ENEMY_ROCKET_GLOW: string; // Свечение ракеты врага
}
