import { useAccount, useProgram, useProgramQuery } from '@gear-js/react-hooks';
import { ZERO_ADDRESS } from 'sails-js';

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
  const [, token] = tokens?.find(([id]) => id === lastTokenID) || [undefined, undefined];
  const data = token ? { mediaUrl: token.media_url } : undefined;

  return { data };
}

export { usePlayerNFT };
