import { useInfiniteQuery } from '@tanstack/react-query';
import { request } from 'graphql-request';

import { graphql } from './codegen';
import { LeaderboardQueryQuery } from './codegen/graphql';

const INDEXER_ADDRESS = import.meta.env.VITE_INDEXER_ADDRESS as string;

const LEADERBOARD_QUERY = graphql(`
  query LeaderboardQuery($first: Int!, $offset: Int!, $from: Datetime, $to: Datetime) {
    leaderboardByDates(first: $first, offset: $offset, from: $from, to: $to) {
      nodes {
        gamesPlayed
        points
        userId
        userName
        shipLevel
      }

      totalCount
    }
  }
`);

const PLAYERS_LIMIT = 20;

const getNextPageParam = (data: LeaderboardQueryQuery, allPages: LeaderboardQueryQuery[]) => {
  if (!data.leaderboardByDates) throw new Error('No players found');

  const { totalCount } = data.leaderboardByDates;
  const fetchedCount = allPages.length * PLAYERS_LIMIT;

  return fetchedCount < totalCount ? fetchedCount : undefined;
};

function usePlayers(filters: { from: string; to: string } | undefined) {
  return useInfiniteQuery({
    queryKey: ['players', filters],

    queryFn: async ({ pageParam }) =>
      request(INDEXER_ADDRESS, LEADERBOARD_QUERY, { ...filters, first: PLAYERS_LIMIT, offset: pageParam }),

    initialPageParam: 0,
    getNextPageParam,
    select: (data) => data.pages.flatMap((page) => page.leaderboardByDates?.nodes ?? []),
  });
}

export { usePlayers };
