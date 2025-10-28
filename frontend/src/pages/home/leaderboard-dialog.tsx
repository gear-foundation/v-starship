import { useAccount } from '@gear-js/react-hooks';
import { DatePickerInput } from '@mantine/dates';
import { X, Trophy, Medal, Award, Loader } from 'lucide-react';
import { useMemo, useState } from 'react';

import { usePlayers } from '@/api/graphql';
import { Button } from '@/components/ui/button';

import { ScrollObserver } from './scroll-observer';

interface LeaderboardDialogProps {
  onClose: () => void;
}

const getTruncatedText = (value: string, prefixLength: number = 6) =>
  `${value.substring(0, prefixLength)}...${value.slice(-prefixLength)}`;

const getEndOfDay = (value: string) => {
  const date = new Date(value);

  date.setUTCHours(23, 59, 59, 999);

  return date;
};

const LAUNCH_DATE = new Date('2025-09-30');
const CURRENT_DATE = new Date();

export default function LeaderboardDialog({ onClose }: LeaderboardDialogProps) {
  const { account } = useAccount();

  const [dateValues, setDateValues] = useState<[string | null, string | null]>([null, null]);

  const timestampFilters = useMemo(() => {
    const [startDate, endDate] = dateValues;

    if (!startDate || !endDate) return;

    return {
      from: new Date(startDate).toISOString(),
      to: getEndOfDay(endDate).toISOString(),
    };
  }, [dateValues]);

  const { data: players, hasNextPage, isFetchingNextPage, fetchNextPage } = usePlayers(timestampFilters);

  const rankedPlayers = players?.map((player, index) => ({ ...player, rank: index + 1 }));

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
    rankedPlayers?.map(({ userId, userName, rank, shipLevel, points, gamesPlayed }) => {
      const isUser = account?.decodedAddress === userId;

      return (
        <div
          key={userId}
          className={`
                px-4 py-3 border-b border-gray-700/30 transition-all duration-200
                ${isUser ? 'bg-cyan-400/10 border-cyan-400/30 glow-blue-bg' : 'hover:bg-gray-800/30'}
              `}>
          <div className="grid grid-cols-12 gap-2 items-center">
            <div className="col-span-2 flex justify-center">{getRankIcon(rank)}</div>

            <div className="col-span-4 flex items-center gap-1">
              <span
                className={`
                    font-bold
                    ${isUser ? 'text-cyan-400 glow-blue' : 'text-white glow-white'}
                     break-all
                  `}>
                {userName || getTruncatedText(userId!)}
              </span>

              {isUser && <span className="text-xs text-cyan-300">(YOU)</span>}
            </div>

            <div className="col-span-2 text-center">
              <span className={`font-bold ${getShipLevelColor(shipLevel!)}`}>LVL {shipLevel}</span>
            </div>

            <div className="col-span-2 text-center">
              <span className="text-gray-400 font-bold">{gamesPlayed}</span>
            </div>

            <div className="col-span-2 text-right">
              <span className="text-green-400 font-bold glow-green">{points}</span>
            </div>
          </div>
        </div>
      );
    });

  return (
    <div className="fixed inset-0 z-10 flex items-center justify-center min-h-full min-w-full p-4">
      {/* Backdrop */}
      {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Leaderboard Dialog (рамка и содержимое по центру) */}
      <div className="relative w-full max-w-xl max-h-[90%] flex flex-col bg-gradient-to-b from-slate-900/95 to-purple-950/95 border-2 border-cyan-400/50 rounded-lg backdrop-blur-md font-['Orbitron']">
        {/* Glow effect */}
        <div className="absolute inset-0 bg-gradient-to-b from-cyan-400/10 to-purple-600/10 rounded-lg blur-xl -z-10"></div>

        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-cyan-400/30">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-bold text-cyan-400 glow-blue">LEADERBOARD</h2>

            <DatePickerInput
              placeholder="Select Dates"
              minDate={LAUNCH_DATE}
              maxDate={CURRENT_DATE}
              type="range"
              size="xs"
              valueFormat="DD.MM.YYYY"
              classNames={{
                input:
                  'bg-gray-900/50 border-2 border-gray-600 text-cyan-300 font-["Orbitron"] placeholder:text-gray-500 hover:border-cyan-400/50 focus:border-cyan-400 transition-all glow-blue-border',
                calendarHeader: 'bg-slate-900/95 border-b border-cyan-400/30 font-["Orbitron"]',
                calendarHeaderControl:
                  'text-cyan-400 hover:bg-cyan-400/10 border border-gray-600 hover:border-cyan-400/50 transition-all font-["Orbitron"]',
                calendarHeaderLevel:
                  'text-cyan-400 font-bold hover:bg-cyan-400/10 border border-gray-600 hover:border-cyan-400/50 transition-all glow-blue font-["Orbitron"]',
                day: 'text-gray-300 hover:bg-cyan-400/20 hover:text-cyan-300 transition-all data-[selected]:bg-cyan-400/30 data-[selected]:text-cyan-400 data-[selected]:font-bold data-[selected]:glow-blue data-[weekend]:text-purple-400 data-[outside]:text-gray-600 font-["Orbitron"]',
                monthsListControl:
                  'text-gray-300 hover:bg-cyan-400/20 hover:text-cyan-400 transition-all data-[selected]:bg-cyan-400/30 data-[selected]:text-cyan-400 data-[selected]:font-bold font-["Orbitron"]',
                yearsListControl:
                  'text-gray-300 hover:bg-cyan-400/20 hover:text-cyan-400 transition-all data-[selected]:bg-cyan-400/30 data-[selected]:text-cyan-400 data-[selected]:font-bold font-["Orbitron"]',
                month: 'bg-gradient-to-b from-slate-900/95 to-purple-950/95',
                weekday: 'font-["Orbitron"]',
              }}
              popoverProps={{
                classNames: {
                  dropdown:
                    'bg-gradient-to-b from-slate-900/95 to-purple-950/95 border-2 border-cyan-400/50 rounded-lg backdrop-blur-md shadow-[0_0_30px_rgba(0,188,212,0.3)]',
                },
              }}
              value={dateValues}
              onChange={setDateValues}
            />
          </div>

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
            <div className="col-span-2 text-center">SHIP LVL</div>
            <div className="col-span-2 text-center">GAMES</div>
            <div className="col-span-2 text-right">PTS</div>
          </div>
        </div>

        {/* Leaderboard Entries */}
        <div className="overflow-y-auto">
          {rankedPlayers &&
            (rankedPlayers.length ? render() : <div className="p-4 text-center text-gray-400">No players found</div>)}

          {!rankedPlayers || isFetchingNextPage ? (
            <Loader className="animate-spin mx-auto my-4" />
          ) : (
            hasNextPage && <ScrollObserver onIntersection={fetchNextPage} />
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-cyan-400/20 text-center">
          <div className="text-cyan-400 text-sm mt-1 glow-blue">Compete with players worldwide!</div>
        </div>
      </div>
    </div>
  );
}
