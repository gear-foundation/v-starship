import { HexString } from '@gear-js/api';
import { useAccount, useProgram, useProgramQuery, useSendProgramTransaction } from '@gear-js/react-hooks';
import { useEffect } from 'react';
import { ZERO_ADDRESS } from 'sails-js';

import { StarshipProgram } from '../programs';
import { PlayerInfo } from '../programs/starship';

const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS as HexString;

function useStarshipProgram() {
  return useProgram({
    library: StarshipProgram,
    id: CONTRACT_ADDRESS,
  });
}

function useConfig() {
  const { data: program } = useStarshipProgram();

  return useProgramQuery({
    program,
    serviceName: 'starship',
    functionName: 'config',
    args: [],
    query: {
      select: (data) => ({
        ftContract: data.ft_contract,
        valuePerPoint: BigInt(data.one_point_in_value),
        maxShipLevel: data.max_level_ship,

        defaults: {
          name: data.default_name,
          attemptsCount: data.default_free_attempts,
          boostersCount: data.default_boosters,
          shipLevel: data.default_level_ship,
        },

        prices: {
          attempt: Number(data.attempt_price),
          booster: Number(data.booster_price),
          ship: Number(data.ship_price),
        },
      }),
    },
  });
}

const formatPlayer = (address: HexString, player: PlayerInfo) => {
  return {
    address,
    name: player.player_name,
    earnedPoints: Number(player.earned_points),
    attemptsCount: player.number_of_attempts,
    boostersCount: player.number_of_boosters,
    shipLevel: player.ship_level,
  };
};

function usePlayer() {
  const { account } = useAccount();
  const { data: program } = useStarshipProgram();

  return useProgramQuery({
    program,
    serviceName: 'starship',
    functionName: 'playerInfo',
    args: [account?.decodedAddress || ZERO_ADDRESS],
    query: {
      enabled: Boolean(account),
      select: (data) => formatPlayer(account?.decodedAddress || ZERO_ADDRESS, data),
    },
    watch: true,
  });
}

function usePlayers() {
  const { data: program } = useStarshipProgram();
  const { data: player } = usePlayer();

  const query = useProgramQuery({
    program,
    serviceName: 'starship',
    functionName: 'allPlayersInfo',
    args: [],
    query: { select: (data) => data.map(([address, _player]) => formatPlayer(address, _player)) },
  });

  useEffect(() => {
    if (player?.name) void query.refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [player?.name]);

  return query;
}

function useTimeToFreeAttempts() {
  const { account } = useAccount();
  const { data: program } = useStarshipProgram();

  const { data: player } = usePlayer();
  const { attemptsCount } = player || {};

  const query = useProgramQuery({
    program,
    serviceName: 'starship',
    functionName: 'timeToFreeAttempts',
    args: [account?.decodedAddress || ZERO_ADDRESS],
    query: { enabled: Boolean(account), select: (data) => Number(data) },
  });

  useEffect(() => {
    if (attemptsCount === 0) void query.refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attemptsCount]);

  return query;
}

function useSetPlayerName() {
  const { data: program } = useStarshipProgram();

  return useSendProgramTransaction({
    program,
    serviceName: 'starship',
    functionName: 'setName',
  });
}

function useBuyPoints() {
  const { data: program } = useStarshipProgram();

  return useSendProgramTransaction({
    program,
    serviceName: 'starship',
    functionName: 'buyPoints',
  });
}

function useAddPoints() {
  const { data: program } = useStarshipProgram();

  return useSendProgramTransaction({
    program,
    serviceName: 'starship',
    functionName: 'addPoints',
  });
}

function useBuyAttempt() {
  const { data: program } = useStarshipProgram();

  return useSendProgramTransaction({
    program,
    serviceName: 'starship',
    functionName: 'buyAttempt',
  });
}

function useBuyBooster() {
  const { data: program } = useStarshipProgram();

  return useSendProgramTransaction({
    program,
    serviceName: 'starship',
    functionName: 'buyBooster',
  });
}

function useBuyShip() {
  const { data: program } = useStarshipProgram();

  return useSendProgramTransaction({
    program,
    serviceName: 'starship',
    functionName: 'buyNewShip',
  });
}

export {
  useConfig,
  usePlayer,
  usePlayers,
  useTimeToFreeAttempts,
  useBuyPoints,
  useAddPoints,
  useSetPlayerName,
  useBuyAttempt,
  useBuyBooster,
  useBuyShip,
};
