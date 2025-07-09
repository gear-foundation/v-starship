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
  });
}

function usePlayer() {
  const { account } = useAccount();
  const { data: program } = useStarshipProgram();

  return useProgramQuery({
    program,
    serviceName: 'starship',
    functionName: 'playersInfo',
    args: [account?.decodedAddress || ZERO_ADDRESS],
    query: { enabled: Boolean(account) },
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

function useBurnPoints() {
  const { data: program } = useStarshipProgram();

  return useSendProgramTransaction({
    program,
    serviceName: 'starship',
    functionName: 'burnPoints',
  });
}

export { useConfig, usePlayer, useBuyPoints, useAddPoints, useBurnPoints };
