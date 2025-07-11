import { useAccount, useAlert, useBalanceFormat, useDeriveBalancesAll } from '@gear-js/react-hooks';
import { useState } from 'react';

import { useConfig, usePlayer, usePointsBalance, useSetPlayerName, useTimeToFreeAttempts } from '@/api/sails';
import { getErrorMessage } from '@/utils';

import InGameScreen from './in-game-screen';
import MainScreen from './main-screen';

type Screen = 'main' | 'game' | 'results';

function Home() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('main');

  const { account } = useAccount();
  const { getFormattedBalance } = useBalanceFormat();
  const alert = useAlert();

  const { data: config } = useConfig();

  const { data: playerPTS } = usePointsBalance();

  const { data: balance } = useDeriveBalancesAll({
    address: account?.address,
    query: { select: (data) => data.transferable?.toBigInt() },
    watch: true,
  });

  const { data: player, isPending: isPlayerFetching } = usePlayer();

  const { sendTransactionAsync: setPlayerName } = useSetPlayerName();
  const {
    name: playerName,
    shipLevel,
    attemptsCount: gamesAvailable,
    boostersCount: boosterCount,
  } = player || { name: 'Player', shipLevel: 1, attemptsCount: 3, boostersCount: 2 };

  const { data: timeToFreeAttempts } = useTimeToFreeAttempts();

  const [gameSessionId, setGameSessionId] = useState(0);

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

  const handleSaveName = (name: string, onSuccess: () => void) => {
    setPlayerName({ args: [name] })
      .then(() => onSuccess())
      .catch((error) => {
        alert.error(getErrorMessage(error));
      });
  };

  if (
    playerPTS === undefined ||
    !config ||
    balance === null ||
    balance === undefined ||
    isPlayerFetching ||
    timeToFreeAttempts === undefined
  )
    return;

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
      playerVARA={balance}
      playerName={playerName}
      onSavePlayerName={handleSaveName}
      boosterCount={boosterCount}
      account={account}
      integerBalanceDisplay={formattedBalance}
      valuePerPoint={config.onePointInValue}
    />
  );
}

export { Home };
