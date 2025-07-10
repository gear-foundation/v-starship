import { HexString } from '@gear-js/api';
import { useAccount, useProgram, useProgramQuery, useSendProgramTransaction } from '@gear-js/react-hooks';
import { ZERO_ADDRESS } from 'sails-js';

import { StartshipProgram } from '../programs';

const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS as HexString;

function useStarshipProgram() {
  return useProgram({
    library: StartshipProgram,
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
        attempt_price: BigInt(data.attempt_price),
        boosterPrice: BigInt(data.booster_price),
        shipPrice: BigInt(data.ship_price),
        onePointInValue: BigInt(data.one_point_in_value),
      }),
    },
  });
}

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
      select: (data) => ({
        name: data.player_name,
        earnedPoints: data.earned_points,
        attemptsCount: data.number_of_attempts,
        boostersCount: data.number_of_boosters,
        shipLevel: data.ship_level,
      }),
    },
    watch: true,
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
    query: { enabled: Boolean(account) },
    watch: true,
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
  useTimeToFreeAttempts,
  useBuyPoints,
  useAddPoints,
  useSetPlayerName,
  useBuyAttempt,
  useBuyBooster,
  useBuyShip,
};
