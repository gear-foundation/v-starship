import { HexString } from '@gear-js/api';
import { useAccount, useProgram, useProgramQuery, useSendProgramTransaction } from '@gear-js/react-hooks';
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
        nftContract: data.nft_contract,
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
    watch: true,
    query: {
      enabled: Boolean(account),
      select: (data) => formatPlayer(account?.decodedAddress || ZERO_ADDRESS, data),
    },
  });
}

// using standalone method because PlayerInfo property is not getting reset unless addPoints is called
function useAttemptsCount() {
  const { account } = useAccount();
  const { data: program } = useStarshipProgram();

  return useProgramQuery({
    program,
    serviceName: 'starship',
    functionName: 'numberOfAttempts',
    args: [account?.decodedAddress || ZERO_ADDRESS],
    watch: true,
    query: { enabled: Boolean(account) },
  });
}

function useTimeToFreeAttempts() {
  const { account } = useAccount();
  const { data: program } = useStarshipProgram();

  return useProgramQuery({
    program,
    serviceName: 'starship',
    functionName: 'timeToFreeAttempts',
    args: [account?.decodedAddress || ZERO_ADDRESS],
    watch: true,
    query: { enabled: Boolean(account), select: (data) => Number(data) },
  });
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
  useAttemptsCount,
  useTimeToFreeAttempts,
  useBuyPoints,
  useAddPoints,
  useSetPlayerName,
  useBuyAttempt,
  useBuyBooster,
  useBuyShip,
};
