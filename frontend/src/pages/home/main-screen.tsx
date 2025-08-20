/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import { HexString } from '@gear-js/api';
import { Account, useAlert } from '@gear-js/react-hooks';
import { Wallet } from '@gear-js/wallet-connect';
import { Edit2, Loader2, Zap } from 'lucide-react';
import React, { useState, useEffect } from 'react';

import { useSetPlayerName } from '@/api/sails';
import { Button } from '@/components/ui/button';
import { getErrorMessage } from '@/utils';

import { IS_DEV_MODE_ENABLED } from './dev-config';
import LeaderboardDialog from './leaderboard-dialog';
import { PlayerShip } from './player-ship';
import ShopDialog from './shop-dialog';
import { SpaceBackground } from './space-background';
import TokenExchangeDialog from './token-exchange-dialog';
import './main-screen.css';
import { useCountdown } from './use-countdown';

interface MainScreenProps {
  onStartGame: () => void;
  playerPTS: number;
  gamesAvailable: number;
  timeToFreeAttempts: number;
  shipLevel: number;
  shipNft: { programId: HexString; id: string } | undefined;
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

export default function MainScreen({
  onStartGame,
  playerPTS,
  gamesAvailable,
  timeToFreeAttempts,
  shipLevel,
  shipNft,
  playerVARA,
  playerName,
  boosterCount,
  account,
  valuePerPoint,
  integerBalanceDisplay,
}: MainScreenProps) {
  const [showShop, setShowShop] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showTokenExchange, setShowTokenExchange] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [tempName, setTempName] = useState(playerName);

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
        .then(() => setEditingName(false))
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

  return (
    <>
      <SpaceBackground />

      <div className="flex flex-col p-4 font-['Orbitron']">
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
          <div className="text-center mb-4">
            <h1 className="text-3xl font-bold text-cyan-400 glow-blue tracking-wider">VARA STARSHIP</h1>
          </div>

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

                {account && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-1 h-6 w-6 text-gray-300 hover:text-cyan-400 border border-gray-600 hover:border-cyan-400 glow-white hover:glow-blue transition-all"
                    onClick={() => setEditingName(true)}
                    title="Edit name">
                    <Edit2 className="h-3 w-3" />
                  </Button>
                )}
              </>
            )}
          </div>

          <PlayerShip level={shipLevel} nft={shipNft} />

          <div className="text-center mb-6">
            <span className="text-white text-lg font-bold glow-white">Level {shipLevel}</span>
          </div>
        </div>

        <div className="text-center mt-auto">
          <div className="mb-3">
            <span className="text-cyan-400 text-base glow-blue">Games available: {gamesAvailable}</span>
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

        <div className="flex flex-col gap-4 px-2 mb-4 w-full max-w-md mx-auto">
          <Button
            onClick={onStartGame}
            className="w-full bg-gradient-to-r from-red-500/80 to-cyan-400/80 border-2 border-red-500 text-white hover:bg-red-500/90 font-bold py-4 text-lg rounded-xl shadow-lg glow-red-border transition-all duration-300 mb-2"
            style={{ minHeight: 56, fontSize: 22, letterSpacing: 2 }}
            disabled={!IS_DEV_MODE_ENABLED && (gamesAvailable === 0 || !account)}>
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

      <ShopDialog
        isOpen={showShop}
        onClose={() => setShowShop(false)}
        playerPTS={playerPTS}
        onGetPTS={handleGetPTSFromShop}
        shipLevel={shipLevel}
      />

      {showLeaderboard && <LeaderboardDialog onClose={() => setShowLeaderboard(false)} />}

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
