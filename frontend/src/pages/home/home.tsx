import { useAccount, useAlert, useBalanceFormat, useDeriveBalancesAll } from '@gear-js/react-hooks';
import { useState, useEffect } from 'react';

import { useAddPoints, useConfig, usePointsBalance } from '@/api/sails';
import { getErrorMessage } from '@/utils';

import { GAME_CONFIG } from './game-config';
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
  const { sendTransactionAsync: addPlayerPTS } = useAddPoints();

  const { data: balance } = useDeriveBalancesAll({
    address: account?.address,
    query: { select: (data) => data.transferable?.toBigInt() },
    watch: true,
  });

  const [gamesAvailable, setGamesAvailable] = useState<number>(3);
  const [lastResetTime, setLastResetTime] = useState<number>(Date.now());
  const [shipLevel, setShipLevel] = useState<number>(1);
  // const [playerVARA, setPlayerVARA] = useState<number>(500);
  const [playerName, setPlayerName] = useState<string>('User1');
  const [boosterCount, setBoosterCount] = useState<number>(GAME_CONFIG.BOOSTER_CONFIG.countPerGame);

  const [gameSessionId, setGameSessionId] = useState(0);

  // Загружаем значения из localStorage только на клиенте
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // const val = localStorage.getItem('playerPTS');
      // if (val) setPlayerPTS(parseInt(val, 10));
      const games = localStorage.getItem('gamesAvailable');
      if (games) setGamesAvailable(parseInt(games, 10));
      const last = localStorage.getItem('lastResetTime');
      if (last) setLastResetTime(parseInt(last, 10));
      const lvl = localStorage.getItem('shipLevel');
      if (lvl) setShipLevel(Math.max(1, Math.min(10, parseInt(lvl, 10))));
      const name = localStorage.getItem('playerName');
      if (name) setPlayerName(name);
      const boosters = localStorage.getItem('boosterCount');
      if (boosters) setBoosterCount(parseInt(boosters, 10));
    }
  }, []);

  // Сохраняем параметры в localStorage при изменении
  // useEffect(() => {
  //   localStorage.setItem('playerPTS', String(playerPTS));
  // }, [playerPTS]);
  useEffect(() => {
    localStorage.setItem('gamesAvailable', String(gamesAvailable));
  }, [gamesAvailable]);
  useEffect(() => {
    localStorage.setItem('lastResetTime', String(lastResetTime));
  }, [lastResetTime]);
  useEffect(() => {
    localStorage.setItem('shipLevel', String(shipLevel));
  }, [shipLevel]);
  useEffect(() => {
    localStorage.setItem('playerName', String(playerName));
  }, [playerName]);
  useEffect(() => {
    localStorage.setItem('boosterCount', String(boosterCount));
  }, [boosterCount]);

  // Проверка и сброс игр раз в минуту
  useEffect(() => {
    const checkReset = () => {
      const now = Date.now();
      const nextReset = getNextResetTime(lastResetTime);
      if (now >= nextReset) {
        setGamesAvailable(3);
        setLastResetTime(nextReset);
      }
    };
    const interval = setInterval(checkReset, 60000);
    checkReset();
    return () => clearInterval(interval);
  }, [lastResetTime]);

  // Получить время следующего сброса (12:00 UTC)
  function getNextResetTime(last: number) {
    const d = new Date(last);
    d.setUTCHours(12, 0, 0, 0);
    if (d.getTime() <= last) d.setUTCDate(d.getUTCDate() + 1);
    return d.getTime();
  }

  // Кнопки сброса
  function resetPTS() {}

  function resetGames() {
    setGamesAvailable(3);
    setLastResetTime(Date.now());
  }

  // Старт игры: уменьшаем gamesAvailable
  function handleStartGame() {
    if (gamesAvailable > 0) {
      setGamesAvailable((g) => g - 1);
      setGameSessionId((id) => id + 1);
      setCurrentScreen('game');
    }
  }

  // Завершение игры: возвращаемся на главную, добавляем PTS
  function handleBackToMenu(earnedPTS: number) {
    addPlayerPTS({ args: [earnedPTS, false] })
      .then(() => setCurrentScreen('main'))
      .catch((error) => alert.error(getErrorMessage(error)));
  }

  // Повтор игры: уменьшаем gamesAvailable и перезапускаем игру
  function handleReplayGame() {
    if (gamesAvailable > 0) {
      setGamesAvailable((g) => g - 1);
      setGameSessionId((id) => id + 1);
      setCurrentScreen('game');
    }
  }

  function handleUpgradeShip() {
    setShipLevel((lvl) => Math.min(10, lvl + 1));
  }

  function handleBuyExtraGame() {
    // setPlayerPTS((prev) => prev - 200);
    setGamesAvailable((prev) => Math.min(3, prev + 1));
  }

  function handleBuyBooster() {
    // setPlayerPTS((prev) => prev - 100);
    setBoosterCount((prev) => prev + 1);
  }

  if (playerPTS === undefined || !config || balance === null || balance === undefined) return;

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
        setBoosterCount={setBoosterCount}
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
      lastResetTime={lastResetTime}
      onResetPTS={resetPTS}
      onResetGames={resetGames}
      shipLevel={shipLevel}
      onUpgradeShip={handleUpgradeShip}
      playerVARA={balance}
      onBuyExtraGame={handleBuyExtraGame}
      playerName={playerName}
      setPlayerName={setPlayerName}
      boosterCount={boosterCount}
      onBuyBooster={handleBuyBooster}
      account={account}
      integerBalanceDisplay={formattedBalance}
      valuePerPoint={config.onePointInValue}
    />
  );
}

export { Home };
