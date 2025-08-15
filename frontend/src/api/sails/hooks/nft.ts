import { useAccount, useProgram, useProgramQuery } from '@gear-js/react-hooks';
import { ZERO_ADDRESS } from 'sails-js';

import { isUndefined } from '@/utils';

import { NFTProgram } from '../programs';

import { useConfig } from './starship';

function useNFTProgram() {
  const { data: config } = useConfig();

  return useProgram({
    library: NFTProgram,
    id: config?.nftContract,
  });
}

function usePlayerNFT() {
  const { account } = useAccount();
  const { data: program } = useNFTProgram();
  const { programId } = program || {};

  const { data: tokenIDs } = useProgramQuery({
    program,
    serviceName: 'nft',
    functionName: 'getTokensIdByOwner',
    args: [account?.decodedAddress || ZERO_ADDRESS],
    query: { enabled: Boolean(account) },
    watch: true,
  });

  const lastTokenID = tokenIDs?.length ? tokenIDs[tokenIDs.length - 1] : undefined;

  const { data: nft } = useProgramQuery({
    program,
    serviceName: 'nft',
    functionName: 'all',
    args: [],
    watch: true,
  });

  const { tokens } = nft || {};
  const [tokenId, token] = tokens?.find(([id]) => id === lastTokenID) || [undefined, undefined];

  const data = programId && !isUndefined(tokenId) && token ? { programId, id: tokenId.toString() } : undefined;
  const isPending = !tokenIDs || !nft;

  return { data, isPending };
}

export { usePlayerNFT };
