import { useAccount, useBalanceFormat } from '@gear-js/react-hooks';
import { Loader } from 'lucide-react';
import { useState } from 'react';

import { useVaraBalance } from '@/api/gear';
import { useConfig, usePlayer, usePlayerNFT, usePointsBalance, useTimeToFreeAttempts } from '@/api/sails';
import { isNullOrUndefined, isUndefined } from '@/utils';

import InGameScreen from './in-game-screen';
import MainScreen from './main-screen';

type Screen = 'main' | 'game' | 'results';

function Home() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('main');

  const { account } = useAccount();
  const { getFormattedBalance } = useBalanceFormat();

  const { data: balance = 0n } = useVaraBalance();
  const { data: config } = useConfig();
  const { data: playerPTS = 0 } = usePointsBalance();

  const { data: player, isPending: isPlayerPending } = usePlayer();
  const { data: playerNFT, isPending: isPlayerNFTPending } = usePlayerNFT();
  const { data: timeToFreeAttempts = 0 } = useTimeToFreeAttempts();

  const [gameSessionId, setGameSessionId] = useState(0);

  if (
    account &&
    (isUndefined(playerPTS) ||
      !config ||
      isNullOrUndefined(balance) ||
      isPlayerPending ||
      isPlayerNFTPending ||
      isUndefined(timeToFreeAttempts))
  )
    return <Loader className="size-8 animate-spin absolute inset-0 m-auto" />;

  const {
    name: playerName,
    shipLevel,
    attemptsCount: gamesAvailable,
    boostersCount: boosterCount,
  } = player || config?.defaults || { name: 'Player', shipLevel: 1, attemptsCount: 0, boostersCount: 0 };

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

  if (currentScreen === 'game') {
    return (
      <InGameScreen
        key={gameSessionId}
        onBackToMenu={handleBackToMenu}
        onReplayGame={handleReplayGame}
        playerPTS={playerPTS}
        gamesAvailable={gamesAvailable}
        shipLevel={shipLevel}
        boosterCount={boosterCount}
        account={account}
        integerBalanceDisplay={formattedBalance}
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
      integerBalanceDisplay={formattedBalance}
      valuePerPoint={config?.valuePerPoint || 1n}
    />
  );
}

export { Home };
