import { useInfiniteQuery } from '@tanstack/react-query';
import { request } from 'graphql-request';

import { graphql } from './codegen';
import { PlayersQueryQuery } from './codegen/graphql';

const INDEXER_ADDRESS = import.meta.env.VITE_INDEXER_ADDRESS as string;

const PLAYERS_QUERY = graphql(`
  query PlayersQuery($first: Int!, $offset: Int!) {
    allPlayers(first: $first, offset: $offset, orderBy: SCORE_DESC) {
      nodes {
        id
        address
        name
        shipLevel
        score
      }

      totalCount
    }
  }
`);

const PLAYERS_LIMIT = 20;

const getNextPageParam = (data: PlayersQueryQuery, allPages: PlayersQueryQuery[]) => {
  if (!data.allPlayers) throw new Error('No players found');

  const { totalCount } = data.allPlayers;
  const fetchedCount = allPages.length * PLAYERS_LIMIT;

  return fetchedCount < totalCount ? fetchedCount : undefined;
};

function usePlayers() {
  return useInfiniteQuery({
    queryKey: ['players'],
    queryFn: ({ pageParam }) => request(INDEXER_ADDRESS, PLAYERS_QUERY, { first: PLAYERS_LIMIT, offset: pageParam }),
    initialPageParam: 0,
    getNextPageParam,
    select: (data) => data.pages.flatMap((page) => page.allPlayers?.nodes ?? []),
  });
}

export { usePlayers };
