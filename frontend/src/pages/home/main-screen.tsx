/* eslint-disable react-refresh/only-export-components */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Account, useAlert } from '@gear-js/react-hooks';
import { Wallet } from '@gear-js/wallet-connect';
import { Edit2, Loader2, Zap } from 'lucide-react';
import React, { useState, useEffect } from 'react';

import { useSetPlayerName } from '@/api/sails';
import { Button } from '@/components/ui/button';
import { getErrorMessage } from '@/utils';

import { GAME_CONFIG } from './game-config';
import LeaderboardDialog from './leaderboard-dialog';
import ShopDialog from './shop-dialog';
import TokenExchangeDialog from './token-exchange-dialog';
import './main-screen.css';
import { useCountdown } from './use-countdown';

interface MainScreenProps {
  onStartGame: () => void;
  playerPTS: number;
  gamesAvailable: number;
  timeToFreeAttempts: number;
  shipLevel: number;
  playerVARA: bigint;
  playerName: string;
  boosterCount: number;
  account: Account | undefined;
  valuePerPoint: bigint;
  integerBalanceDisplay: { value?: string; unit?: string };
}

// Стабильное форматирование чисел для SSR/CSR
function formatNumber(n: number) {
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

// === ПАРАМЕТРЫ РАЗМЕРА КОРАБЛЯ ИГРОКА ===
// Для главного экрана корабль в 2 раза больше, чем в игре
const BASE_SHIP_SIZE = GAME_CONFIG.PLAYER_SHIP_BASE_SIZE * 2;
const SHIP_SIZE_STEP = GAME_CONFIG.PLAYER_SHIP_SIZE_STEP * 2;

// === КОНФИГ ДЛЯ ГЕНЕРАЦИИ ФОНА ГЛАВНОГО ЭКРАНА ===
export const MAIN_BG_CONFIG = {
  ...GAME_CONFIG.GAME_BG_CONFIG,
  starCount: { min: 18, max: 32 },
  planetCount: { min: 1, max: 3 },
  planetSize: { min: 40, max: 90 },
  planetOpacity: { min: 0.25, max: 0.6 },
  nebulaCount: { min: 1, max: 3 },
  nebulaSize: { min: 120, max: 220 },
  nebulaOpacity: { min: 0.1, max: 0.25 },
};

// === ФУНКЦИЯ ГЕНЕРАЦИИ ПАРАМЕТРОВ ФОНА ===
function generateMainBgParams(cfg = MAIN_BG_CONFIG) {
  // Генерация звёзд
  const starCount = Math.floor(cfg.starCount.min + Math.random() * (cfg.starCount.max - cfg.starCount.min + 1));
  const stars = Array.from({ length: starCount }, () => ({
    x: Math.random(),
    y: Math.random(),
    size: cfg.starSize.min + Math.random() * (cfg.starSize.max - cfg.starSize.min),
    color: cfg.starColors[Math.floor(Math.random() * cfg.starColors.length)],
    twinkle: cfg.starTwinkle.min + Math.random() * (cfg.starTwinkle.max - cfg.starTwinkle.min),
    phase: Math.random() * Math.PI * 2,
  }));
  // Генерация планет
  const planetCount = Math.floor(cfg.planetCount.min + Math.random() * (cfg.planetCount.max - cfg.planetCount.min + 1));
  const planets = Array.from({ length: planetCount }, () => {
    const colorPair = cfg.planetColors[Math.floor(Math.random() * cfg.planetColors.length)];
    return {
      x: Math.random(),
      y: Math.random(),
      size: cfg.planetSize.min + Math.random() * (cfg.planetSize.max - cfg.planetSize.min),
      colorFrom: colorPair[0],
      colorTo: colorPair[1],
      opacity: cfg.planetOpacity.min + Math.random() * (cfg.planetOpacity.max - cfg.planetOpacity.min),
      blur: 8 + Math.random() * 12,
    };
  });
  // Генерация туманностей
  const nebulaCount = Math.floor(cfg.nebulaCount.min + Math.random() * (cfg.nebulaCount.max - cfg.nebulaCount.min + 1));
  const nebulas = Array.from({ length: nebulaCount }, () => {
    const colorPair = cfg.nebulaColors[Math.floor(Math.random() * cfg.nebulaColors.length)];
    return {
      x: Math.random(),
      y: Math.random(),
      size: cfg.nebulaSize.min + Math.random() * (cfg.nebulaSize.max - cfg.nebulaSize.min),
      colorFrom: colorPair[0],
      colorTo: colorPair[1],
      opacity: cfg.nebulaOpacity.min + Math.random() * (cfg.nebulaOpacity.max - cfg.nebulaOpacity.min),
      blur: 32 + Math.random() * 32,
    };
  });
  // Цвет поля
  const fieldColor = cfg.fieldColors[Math.floor(Math.random() * cfg.fieldColors.length)];
  return { stars, planets, nebulas, fieldColor };
}

export default function MainScreen({
  onStartGame,
  playerPTS,
  gamesAvailable,
  timeToFreeAttempts,
  shipLevel,
  playerVARA,
  playerName,
  boosterCount,
  account,
  valuePerPoint,
  integerBalanceDisplay,
}: MainScreenProps) {
  // const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0 });
  const [showShop, setShowShop] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showTokenExchange, setShowTokenExchange] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [tempName, setTempName] = useState(playerName);

  // Генерируем фон только на клиенте после монтирования (SSR-safe)
  const [bgParams, setBgParams] = useState<any>(null);
  useEffect(() => {
    setBgParams(generateMainBgParams());
  }, []);

  // === АНИМАЦИЯ ПУЛЬСАЦИИ ЗВЁЗД ===
  const [starAnimTime, setStarAnimTime] = useState(0);
  useEffect(() => {
    if (!bgParams) return;
    let running = true;
    function animate() {
      if (!running) return;
      setStarAnimTime(Date.now());
      requestAnimationFrame(animate);
    }
    animate();
    return () => {
      running = false;
    };
  }, [bgParams]);

  // Таймер до следующего сброса игр
  const timeLeftMs = useCountdown(timeToFreeAttempts);

  const timeLeft = {
    hours: Math.floor((timeLeftMs || 0) / 3600000),
    minutes: Math.floor(((timeLeftMs || 0) % 3600000) / 60000),
  };

  // Синхронизируем tempName при изменении playerName (например, после сброса)
  useEffect(() => {
    setTempName(playerName);
  }, [playerName]);

  const alert = useAlert();
  const { sendTransactionAsync: setPlayerName, isPending: isSettingName } = useSetPlayerName();

  // Обработчик сохранения имени
  const handleSaveName = () => {
    const trimmed = tempName.trim();
    if (trimmed.length > 0 && trimmed.length <= 16) {
      setPlayerName({ args: [trimmed] })
        .then(() => () => setEditingName(false))
        .catch((error) => {
          alert.error(getErrorMessage(error));
        });
    }
  };

  // Обработчик Enter в инпуте
  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSaveName();
    if (e.key === 'Escape') setEditingName(false);
  };

  const handlePTSClick = () => {
    setShowTokenExchange(true);
  };

  const handleGetPTSFromShop = () => {
    setShowShop(false);
    setShowTokenExchange(true);
  };

  // SSR-safe: если фон ещё не сгенерирован, не рендерим визуал
  if (!bgParams) return null;

  return (
    <>
      <div
        className="fixed inset-0 min-h-screen w-full flex items-center justify-center"
        style={{ background: bgParams.fieldColor }}>
        {/* Viewport 20:9 */}
        <div className="game-viewport relative flex flex-col h-full w-full overflow-hidden">
          {/* === СЛУЧАЙНО СГЕНЕРИРОВАННЫЙ КОСМИЧЕСКИЙ ФОН === */}
          <div
            className="absolute inset-0 w-full h-full pointer-events-none select-none overflow-hidden"
            style={{ borderRadius: 24, zIndex: 0 }}>
            {/* Пульсирующие звёзды */}
            {bgParams.stars.map((star: any, i: number) => {
              const pulse = 0.7 + star.twinkle * Math.sin(starAnimTime / 600 + star.phase);
              return (
                <div
                  key={i}
                  style={{
                    position: 'absolute',
                    left: `${star.x * 100}%`,
                    top: `${star.y * 100}%`,
                    width: `${star.size * pulse}px`,
                    height: `${star.size * pulse}px`,
                    background: star.color,
                    borderRadius: '50%',
                    opacity: 0.7 + 0.3 * Math.sin(starAnimTime / 800 + star.phase),
                    filter: 'blur(0.5px)',
                    zIndex: 1,
                    pointerEvents: 'none',
                  }}
                />
              );
            })}
            {/* Планеты */}
            {bgParams.planets.map((planet: any, i: number) => (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  left: `${planet.x * 100}%`,
                  top: `${planet.y * 100}%`,
                  width: `${planet.size}px`,
                  height: `${planet.size}px`,
                  background: `linear-gradient(135deg, ${planet.colorFrom}, ${planet.colorTo})`,
                  borderRadius: '50%',
                  opacity: planet.opacity,
                  filter: `blur(${planet.blur}px)`,
                  zIndex: 2,
                  pointerEvents: 'none',
                }}
              />
            ))}
            {/* Туманности */}
            {bgParams.nebulas.map((nebula: any, i: number) => (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  left: `${nebula.x * 100}%`,
                  top: `${nebula.y * 100}%`,
                  width: `${nebula.size}px`,
                  height: `${nebula.size}px`,
                  background: `radial-gradient(circle, ${nebula.colorFrom} 0%, ${nebula.colorTo} 100%)`,
                  borderRadius: '50%',
                  opacity: nebula.opacity,
                  filter: `blur(${nebula.blur}px)`,
                  zIndex: 1,
                  pointerEvents: 'none',
                }}
              />
            ))}
          </div>

          {/* Main Content */}
          <div className="relative z-10 flex flex-col h-full w-full p-4 font-['Orbitron',monospace]">
            {/* Header: Wallet, PTS */}
            <div className="flex flex-col items-center mb-4">
              <div
                className={`w-full flex items-center ${account ? 'justify-between' : 'justify-center'} wallet-custom-styles mb-2`}>
                {account && (
                  <p className="text-purple-300 font-bold text-lg glow-purple cursor-default">
                    <span className="font-black tracking-wider">{integerBalanceDisplay.value}</span>{' '}
                    {integerBalanceDisplay.unit}
                  </p>
                )}
                <Wallet displayBalance={false} />
              </div>

              <div
                className="text-cyan-400 font-bold text-lg glow-blue cursor-pointer hover:text-blue-300 hover:glow-blue-bright transition-all"
                onClick={handlePTSClick}>
                PTS: {formatNumber(playerPTS)}
              </div>
            </div>

            <div className="flex flex-col items-center justify-center text-center mt-8">
              {/* Game Title */}
              <div className="text-center mb-4">
                <h1 className="text-3xl font-bold text-cyan-400 glow-blue tracking-wider">VARA STARSHIP</h1>
              </div>

              {/* Player Name */}
              <div className="flex items-center justify-center gap-2 mb-6">
                {editingName ? (
                  <>
                    <input
                      type="text"
                      value={tempName}
                      onChange={(e) => setTempName(e.target.value)}
                      onKeyDown={handleInputKeyDown}
                      maxLength={16}
                      className="text-gray-300 text-lg bg-gray-900 border border-cyan-400 rounded px-2 py-1 outline-none glow-white focus:border-cyan-300 w-32 text-center"
                      aria-label="Player name input"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      className="p-1 h-6 w-6 text-cyan-400 border border-cyan-400 glow-blue"
                      onClick={handleSaveName}
                      title="Save name">
                      {isSettingName ? <Loader2 className="animate-spin" /> : <span className="font-bold">⏎</span>}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="p-1 h-6 w-6 text-gray-400 border border-gray-600 ml-1"
                      onClick={() => setEditingName(false)}
                      title="Отмена">
                      <span className="font-bold">✕</span>
                    </Button>
                  </>
                ) : (
                  <>
                    <span className="text-gray-300 text-lg glow-white">{playerName}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="p-1 h-6 w-6 text-gray-300 hover:text-cyan-400 border border-gray-600 hover:border-cyan-400 glow-white hover:glow-blue transition-all"
                      onClick={() => setEditingName(true)}
                      title="Edit name">
                      <Edit2 className="h-3 w-3" />
                    </Button>
                  </>
                )}
              </div>

              {/* Player Ship */}
              <div className="flex justify-center mb-4">
                <img
                  src={`/img/starship-${shipLevel}.png`}
                  alt="player ship"
                  width={BASE_SHIP_SIZE + SHIP_SIZE_STEP * (shipLevel - 1)}
                  height={BASE_SHIP_SIZE + SHIP_SIZE_STEP * (shipLevel - 1)}
                  className="select-none pointer-events-none"
                  style={{
                    width: `${BASE_SHIP_SIZE + SHIP_SIZE_STEP * (shipLevel - 1)}px`,
                    height: `${BASE_SHIP_SIZE + SHIP_SIZE_STEP * (shipLevel - 1)}px`,
                    userSelect: 'none',
                  }}
                />
              </div>

              {/* Ship Level */}
              <div className="text-center mb-6">
                <span className="text-white text-lg font-bold glow-white">Level {shipLevel}</span>
              </div>
            </div>

            {/* Games, Timer, Boosters */}
            <div className="text-center mt-auto">
              <div className="mb-3">
                <span className="text-cyan-400 text-base glow-blue">Games available: {gamesAvailable} of 3</span>
              </div>

              {Boolean(timeLeftMs) && (
                <div className="mb-3">
                  <span className="text-gray-400 text-sm glow-gray">
                    Next free games in: {String(timeLeft.hours).padStart(2, '0')}:
                    {String(timeLeft.minutes).padStart(2, '0')}
                  </span>
                </div>
              )}

              <div className="mb-8">
                <div className="flex items-center justify-center gap-2">
                  <Zap className="h-4 w-4 text-yellow-400" />
                  <span className="text-yellow-400 text-base glow-yellow">Boosters: {boosterCount}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-4 px-2 mb-4 w-full max-w-md mx-auto">
              <Button
                onClick={onStartGame}
                className="w-full bg-gradient-to-r from-red-500/80 to-cyan-400/80 border-2 border-red-500 text-white hover:bg-red-500/90 font-bold py-4 text-lg rounded-xl shadow-lg glow-red-border transition-all duration-300 mb-2"
                style={{ minHeight: 56, fontSize: 22, letterSpacing: 2 }}
                disabled={gamesAvailable === 0}>
                START GAME
              </Button>
              <div className="flex gap-3 w-full">
                <Button
                  variant="outline"
                  onClick={() => setShowShop(true)}
                  className="flex-1 bg-transparent border-2 border-cyan-400 text-cyan-400 hover:text-cyan-400 hover:bg-cyan-400/10 font-bold py-3 rounded-lg glow-blue-border transition-all duration-300 hover:shadow-lg hover:shadow-cyan-400/25"
                  style={{ minWidth: 0 }}>
                  SHOP
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowLeaderboard(true)}
                  className="flex-1 bg-transparent border-2 border-cyan-400 text-cyan-400 hover:text-cyan-400 hover:bg-cyan-400/10 font-bold py-3 rounded-lg glow-blue-border transition-all duration-300 hover:shadow-lg hover:shadow-cyan-400/25"
                  style={{ minWidth: 0 }}>
                  LEADERBOARD
                </Button>
              </div>
            </div>
          </div>
        </div>

        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&display=swap');

          .game-viewport {
            aspect-ratio: 20/9;
            max-height: 100vh;
            width: 100vw;
            max-width: calc(100vh * 9 / 20);
            background: transparent;
            box-shadow:
              0 0 32px 0 #000a,
              0 0 0 100vmax #000a;
            border-radius: 24px;
            position: relative;
            overflow: hidden;
            display: flex;
            flex-direction: column;
            align-items: stretch;
            justify-content: stretch;
          }

          .glow-blue {
            text-shadow:
              0 0 10px #00bcd4,
              0 0 20px #00bcd4,
              0 0 30px #00bcd4;
          }

          .glow-blue-bright {
            text-shadow:
              0 0 15px #00bcd4,
              0 0 30px #00bcd4,
              0 0 45px #00bcd4;
          }

          .glow-white {
            text-shadow:
              0 0 10px #ffffff,
              0 0 20px #ffffff;
          }

          .glow-gray {
            text-shadow: 0 0 8px #9ca3af;
          }

          .glow-yellow {
            text-shadow:
              0 0 10px #fbbf24,
              0 0 20px #fbbf24;
          }

          .glow-blue-border {
            box-shadow: 0 0 15px rgba(0, 188, 212, 0.5);
          }

          .glow-red-border {
            box-shadow: 0 0 15px rgba(239, 68, 68, 0.5);
          }

          .glow-purple-border-soft {
            box-shadow: 0 0 15px rgba(192, 132, 252, 0.4);
          }

          .glow-purple {
            text-shadow:
              0 0 10px #c084fc,
              0 0 20px #c084fc;
          }

          .bg-gradient-radial {
            background: radial-gradient(circle, var(--tw-gradient-stops));
          }
        `}</style>
      </div>

      {/* Dialog Overlays */}
      <ShopDialog
        isOpen={showShop}
        onClose={() => setShowShop(false)}
        playerPTS={playerPTS}
        onGetPTS={handleGetPTSFromShop}
        shipLevel={shipLevel}
      />

      <LeaderboardDialog isOpen={showLeaderboard} onClose={() => setShowLeaderboard(false)} />

      <TokenExchangeDialog
        isOpen={showTokenExchange}
        onClose={() => setShowTokenExchange(false)}
        playerVARA={playerVARA}
        account={account}
        balanceValue={integerBalanceDisplay.value}
        balanceUnit={integerBalanceDisplay.unit}
        valuePerPoint={valuePerPoint}
      />
    </>
  );
}
