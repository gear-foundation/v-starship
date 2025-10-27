import { useInfiniteQuery } from '@tanstack/react-query';
import { request } from 'graphql-request';

import { graphql } from './codegen';

const INDEXER_ADDRESS = import.meta.env.VITE_INDEXER_ADDRESS as string;

const PLAYERS_QUERY = graphql(`
  query PlayersQuery($first: Int!, $offset: Int!) {
    allPlayers(first: $first, offset: $offset, orderBy: SCORE_DESC) {
      nodes {
        id
        name
        shipLevel
        score
      }

      totalCount
    }
  }
`);

const GAMES_QUERY = graphql(`
  query GamesQuery($filter: GameFilter) {
    allGames(filter: $filter) {
      nodes {
        id
        timestamp
        points
      }

      totalCount
    }
  }
`);

const PLAYERS_LIMIT = 20;

const getPlayersWithGames = async (pageParam: number) => {
  const playersQuery = await request(INDEXER_ADDRESS, PLAYERS_QUERY, { first: PLAYERS_LIMIT, offset: pageParam });
  const players = playersQuery.allPlayers?.nodes ?? [];

  const playersWithGames = await Promise.all(
    players.map(async (player) => {
      const filter = { playerAddress: { equalTo: player.id } };

      const gamesQuery = await request(INDEXER_ADDRESS, GAMES_QUERY, { filter });
      const games = gamesQuery.allGames?.nodes ?? [];

      return { ...player, games };
    }),
  );

  return { playersWithGames, totalCount: playersQuery.allPlayers?.totalCount ?? 0 };
};

type PlayersWithGames = Awaited<ReturnType<typeof getPlayersWithGames>>;

const getNextPageParam = (data: PlayersWithGames, allPages: PlayersWithGames[]) => {
  if (!data.playersWithGames) throw new Error('No players found');

  const { totalCount } = data;
  const fetchedCount = allPages.length * PLAYERS_LIMIT;

  return fetchedCount < totalCount ? fetchedCount : undefined;
};

function usePlayers() {
  return useInfiniteQuery({
    queryKey: ['players'],

    queryFn: async ({ pageParam }) => getPlayersWithGames(pageParam),

    initialPageParam: 0,
    getNextPageParam,

    select: (data) => data.pages.flatMap((page) => page.playersWithGames ?? []),
  });
}

export { usePlayers };
