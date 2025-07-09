import { useAccount, useProgram, useProgramQuery } from '@gear-js/react-hooks';
import { ZERO_ADDRESS } from 'sails-js';

import { VFTProgram } from '../programs';

import { useConfig } from './starship';

function useVFTProgram() {
  const { data: config } = useConfig();

  return useProgram({
    library: VFTProgram,
    id: config?.ft_contract,
  });
}

function usePointsBalance() {
  const { account } = useAccount();
  const { data: program } = useVFTProgram();

  return useProgramQuery({
    program,
    serviceName: 'vft',
    functionName: 'balanceOf',
    args: [account?.decodedAddress || ZERO_ADDRESS],
    query: { enabled: Boolean(account) },
    watch: true,
  });
}

export { usePointsBalance };
