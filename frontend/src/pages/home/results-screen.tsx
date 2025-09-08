import { useAlert } from '@gear-js/react-hooks';
import { Trophy, Skull, RotateCcw, Home } from 'lucide-react';

import { useAddPoints } from '@/api/sails';
import { Button } from '@/components/ui/button';
import { getErrorMessage } from '@/utils';

import { IS_DEV_MODE_ENABLED } from './dev-config';

interface ResultsScreenProps {
  isOpen: boolean;
  onClose: () => void;
  onReplay?: () => void;
  isVictory: boolean;
  ptsEarned: number;
  playerPTS: number;
  playerVARA: number;
  enemiesDefeated: number;
  asteroidsKilled: number;
  minesKilled: number;
  activatedBoostersCount: number;
}

export function ResultsScreen({
  isOpen,
  onClose,
  onReplay,
  isVictory,
  ptsEarned,
  playerPTS,
  playerVARA,
  enemiesDefeated,
  asteroidsKilled,
  minesKilled,
  activatedBoostersCount,
}: ResultsScreenProps) {
  const alert = useAlert();
  const { sendTransactionAsync: addPlayerPTS, isPending: isAddingPTS } = useAddPoints();

  const handleBackToMenu = () => {
    if (IS_DEV_MODE_ENABLED) return onClose();

    addPlayerPTS({ args: [ptsEarned, activatedBoostersCount] })
      .then(() => onClose())
      .catch((error) => alert.error(getErrorMessage(error)));
  };

  const handleReplay = () => {
    if (IS_DEV_MODE_ENABLED) return onReplay?.();

    addPlayerPTS({ args: [ptsEarned, activatedBoostersCount] })
      .then(() => onReplay?.())
      .catch((error) => alert.error(getErrorMessage(error)));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-10 flex items-center justify-center min-h-full min-w-full p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      {/* Results Dialog (рамка и содержимое по центру) */}
      <div
        className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md max-h-[90%] flex flex-col bg-gradient-to-b from-slate-900/95 to-purple-950/95 border-2 rounded-lg backdrop-blur-md font-['Orbitron'] ${isVictory ? 'from-cyan-400/10 to-purple-600/10' : 'from-red-500/10 to-purple-600/10'}`}
        style={{ borderColor: isVictory ? 'rgba(34,211,238,0.5)' : 'rgba(239,68,68,0.5)' }}>
        {/* Header */}
        <div className="flex justify-between items-center p-4">
          <div className="text-cyan-400 font-bold text-lg glow-blue">PTS: {playerPTS.toLocaleString()}</div>
          <div className="text-gray-300 font-bold text-lg glow-white">VARA: {playerVARA.toLocaleString()}</div>
        </div>

        {/* Result Banner */}
        <div
          className={`
            py-6 px-4 text-center mb-4
            ${
              isVictory
                ? 'bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-cyan-500/20'
                : 'bg-gradient-to-r from-red-500/20 via-purple-500/20 to-red-500/20'
            }
          `}>
          <div className="flex justify-center mb-2">
            {isVictory ? (
              <Trophy className="h-16 w-16 text-yellow-400 glow-yellow" />
            ) : (
              <Skull className="h-16 w-16 text-red-400 glow-red" />
            )}
          </div>
          <h2
            className={`
              text-4xl font-bold tracking-wider
              ${isVictory ? 'text-cyan-400 glow-blue' : 'text-red-400 glow-red'}
            `}>
            {isVictory ? 'VICTORY' : 'DEFEAT'}
          </h2>
        </div>

        {/* PTS Earned */}
        <div className="px-6 py-4 text-center flex flex-col items-center justify-center overflow-y-auto">
          <div className="text-xl text-gray-300 glow-white mb-2">PTS EARNED</div>
          <div
            className={`
              text-3xl font-bold mb-4 animate-pulse
              ${isVictory ? 'text-green-400 glow-green' : 'text-yellow-400 glow-yellow'}
            `}
            style={{ minWidth: 120 }}>
            {ptsEarned.toLocaleString()}
          </div>

          {/* Total Enemies Defeated */}
          <div className="text-lg text-cyan-300 font-bold mb-1 mt-2">ENEMIES DEFEATED = {enemiesDefeated}</div>
          {/* Подробная строка по типам */}
          <div className="text-base text-gray-300 mb-6">
            Aliens: <span className="text-white font-bold">{enemiesDefeated - asteroidsKilled - minesKilled}</span>
            {'   '}Mines: <span className="text-white font-bold">{minesKilled}</span>
            {'   '}Asteroids: <span className="text-white font-bold">{asteroidsKilled}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-6 flex flex-col items-center gap-4">
          {onReplay && (
            <Button
              onClick={handleReplay}
              className={`
              w-full font-bold py-6 text-xl flex items-center justify-center gap-2 transition-all duration-300
              bg-transparent border-2 hover:bg-opacity-10 hover:shadow-lg
              ${
                isVictory
                  ? 'border-red-500 text-red-400 hover:bg-red-500/10 glow-red-border hover:shadow-red-500/25'
                  : 'border-red-500 text-red-400 hover:bg-red-500/10 glow-red-border hover:shadow-red-500/25'
              }
            `}
              disabled={isAddingPTS}>
              <RotateCcw className="h-5 w-5" />
              {isAddingPTS ? 'PROCESSING...' : 'REPLAY'}
            </Button>
          )}

          <Button
            onClick={handleBackToMenu}
            variant="outline"
            className="w-3/4 bg-transparent border-2 border-cyan-400 text-cyan-400 hover:bg-cyan-400/10 font-bold py-2 text-sm glow-blue-border transition-all duration-300 flex items-center justify-center gap-2"
            disabled={isAddingPTS}>
            <Home className="h-4 w-4" />
            {isAddingPTS ? 'PROCESSING...' : 'BACK TO MENU'}
          </Button>
        </div>
      </div>
    </div>
  );
}
