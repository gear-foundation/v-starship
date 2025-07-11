import { useAccount } from '@gear-js/react-hooks';
import { X, Trophy, Medal, Award } from 'lucide-react';

import { usePlayers } from '@/api/sails';
import { Button } from '@/components/ui/button';

interface LeaderboardDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LeaderboardDialog({ isOpen, onClose }: LeaderboardDialogProps) {
  const { account } = useAccount();
  const { data: players } = usePlayers();

  const rankedPlayers =
    players?.sort((a, b) => b.earnedPoints - a.earnedPoints).map((player, index) => ({ ...player, rank: index + 1 })) ||
    [];

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-5 w-5 text-yellow-400 glow-yellow" />;
      case 2:
        return <Medal className="h-5 w-5 text-gray-300 glow-white" />;
      case 3:
        return <Award className="h-5 w-5 text-amber-600 glow-amber" />;
      default:
        return <span className="text-cyan-400 font-bold glow-blue">#{rank}</span>;
    }
  };

  const getShipLevelColor = (level: number) => {
    if (level >= 9) return 'text-purple-400 glow-purple';
    if (level >= 7) return 'text-blue-400 glow-blue';
    if (level >= 5) return 'text-green-400 glow-green';
    if (level >= 3) return 'text-yellow-400 glow-yellow';
    return 'text-gray-400 glow-gray';
  };

  const render = () =>
    rankedPlayers.map(({ address, name, rank, shipLevel, earnedPoints }) => {
      const isUser = account?.decodedAddress === address;

      return (
        <div
          key={address}
          className={`
                px-4 py-3 border-b border-gray-700/30 transition-all duration-200
                ${isUser ? 'bg-cyan-400/10 border-cyan-400/30 glow-blue-bg' : 'hover:bg-gray-800/30'}
              `}>
          <div className="grid grid-cols-12 gap-2 items-center">
            <div className="col-span-2 flex justify-center">{getRankIcon(rank)}</div>

            <div className="col-span-4">
              <span
                className={`
                    font-bold
                    ${isUser ? 'text-cyan-400 glow-blue' : 'text-white glow-white'}
                  `}>
                {name}
              </span>
              {isUser && <span className="ml-2 text-xs text-cyan-300">(YOU)</span>}
            </div>

            <div className="col-span-3 text-center">
              <span className={`font-bold ${getShipLevelColor(shipLevel)}`}>LV {shipLevel}</span>
            </div>

            <div className="col-span-3 text-right">
              <span className="text-green-400 font-bold glow-green">{earnedPoints}</span>
            </div>
          </div>
        </div>
      );
    });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center min-h-screen min-w-full p-4">
      {/* Backdrop */}
      {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Leaderboard Dialog (рамка и содержимое по центру) */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-gradient-to-b from-slate-900/95 to-purple-950/95 border-2 border-cyan-400/50 rounded-lg backdrop-blur-md font-['Orbitron',monospace]">
        {/* Glow effect */}
        <div className="absolute inset-0 bg-gradient-to-b from-cyan-400/10 to-purple-600/10 rounded-lg blur-xl -z-10"></div>

        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-cyan-400/30">
          <h2 className="text-2xl font-bold text-cyan-400 glow-blue">LEADERBOARD</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-red-400 border border-gray-600 hover:border-red-400 glow-white hover:glow-red transition-all">
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Table Header */}
        <div className="px-4 py-3 border-b border-cyan-400/20">
          <div className="grid grid-cols-12 gap-2 text-sm font-bold text-cyan-400 glow-blue">
            <div className="col-span-2 text-center">RANK</div>
            <div className="col-span-4">PLAYER</div>
            <div className="col-span-3 text-center">SHIP LV</div>
            <div className="col-span-3 text-right">PTS</div>
          </div>
        </div>

        {/* Leaderboard Entries */}
        <div className="max-h-96 overflow-y-auto">{render()}</div>

        {/* Footer */}
        <div className="p-4 border-t border-cyan-400/20 text-center">
          <div className="text-gray-400 text-sm">Rankings updated every 24 hours</div>
          <div className="text-cyan-400 text-xs mt-1 glow-blue">Compete with players worldwide!</div>
        </div>
      </div>

      <style>{`
        .glow-blue {
          text-shadow:
            0 0 10px #00bcd4,
            0 0 20px #00bcd4;
        }

        .glow-white {
          text-shadow:
            0 0 10px #ffffff,
            0 0 20px #ffffff;
        }

        .glow-red {
          text-shadow:
            0 0 10px #ef4444,
            0 0 20px #ef4444;
        }

        .glow-yellow {
          text-shadow:
            0 0 10px #fbbf24,
            0 0 20px #fbbf24;
        }

        .glow-green {
          text-shadow:
            0 0 10px #10b981,
            0 0 20px #10b981;
        }

        .glow-purple {
          text-shadow:
            0 0 10px #a855f7,
            0 0 20px #a855f7;
        }

        .glow-amber {
          text-shadow:
            0 0 10px #d97706,
            0 0 20px #d97706;
        }

        .glow-gray {
          text-shadow: 0 0 8px #9ca3af;
        }

        .glow-blue-bg {
          box-shadow: 0 0 10px rgba(0, 188, 212, 0.3);
        }

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
      `}</style>
    </div>
  );
}
