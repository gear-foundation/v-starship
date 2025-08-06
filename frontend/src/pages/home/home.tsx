import { useAccount, useBalanceFormat } from '@gear-js/react-hooks';
import { Loader } from 'lucide-react';
import { useState } from 'react';

import { useVaraBalance } from '@/api/gear';
import {
  useAttemptsCount,
  useConfig,
  usePlayer,
  usePlayerNFT,
  usePointsBalance,
  useTimeToFreeAttempts,
} from '@/api/sails';
import { isUndefined } from '@/utils';

import InGameScreen from './in-game-screen';
import MainScreen from './main-screen';

type Screen = 'main' | 'game' | 'results';

function Home() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('main');

  const { account } = useAccount();
  const { getFormattedBalance } = useBalanceFormat();

  const { data: balance = 0n, isPending: isBalancePending } = useVaraBalance();
  const { data: config } = useConfig();
  const { data: playerPTS = 0, isPending: isPlayerPTSPending } = usePointsBalance();

  const { data: player, isPending: isPlayerPending } = usePlayer();
  const { data: playerNFT, isPending: isPlayerNFTPending } = usePlayerNFT();
  const { data: attemptsCount, isPending: isAttemptsCountPending } = useAttemptsCount();
  const { data: timeToFreeAttempts = 0, isPending: isTimeToFreeAttemptsPending } = useTimeToFreeAttempts();

  const [gameSessionId, setGameSessionId] = useState(0);

  if (
    !config ||
    (account &&
      (isBalancePending ||
        isPlayerPTSPending ||
        isPlayerPending ||
        isPlayerNFTPending ||
        isAttemptsCountPending ||
        isTimeToFreeAttemptsPending))
  )
    return <Loader className="size-8 animate-spin absolute inset-0 m-auto" />;

  const { name: playerName, shipLevel, boostersCount: boosterCount } = player || config.defaults;
  const gamesAvailable = isUndefined(attemptsCount) ? config.defaults.attemptsCount : attemptsCount;

  function handleStartGame() {
    if (gamesAvailable > 0) {
      setGameSessionId((id) => id + 1);
      setCurrentScreen('game');
    }
  }

  function handleBackToMenu() {
    setCurrentScreen('main');
  }

  function handleReplayGame() {
    if (gamesAvailable > 0) {
      setGameSessionId((id) => id + 1);
      setCurrentScreen('game');
    }
  }

  const formattedBalance = getFormattedBalance(balance);
  const integerBalance = { ...formattedBalance, value: formattedBalance.value.split('.')[0] };

  if (currentScreen === 'game') {
    return (
      <InGameScreen
        key={gameSessionId}
        onBackToMenu={handleBackToMenu}
        onReplayGame={handleReplayGame}
        playerPTS={playerPTS}
        gamesAvailable={gamesAvailable}
        shipLevel={shipLevel}
        shipImageUrl={playerNFT?.mediaUrl}
        boosterCount={boosterCount}
        account={account}
        integerBalanceDisplay={integerBalance}
      />
    );
  }

  return (
    <MainScreen
      onStartGame={handleStartGame}
      playerPTS={playerPTS}
      gamesAvailable={gamesAvailable}
      timeToFreeAttempts={timeToFreeAttempts}
      shipLevel={shipLevel}
      shipNft={playerNFT}
      playerVARA={balance}
      playerName={playerName}
      boosterCount={boosterCount}
      account={account}
      integerBalanceDisplay={integerBalance}
      valuePerPoint={config.valuePerPoint}
    />
  );
}

export { Home };
