import { useInfiniteQuery } from '@tanstack/react-query';
import { request } from 'graphql-request';

import { graphql } from './codegen';
import { GameFilter } from './codegen/graphql';

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
        playerAddress
        timestamp
        points
      }

      totalCount
    }
  }
`);

const PLAYERS_LIMIT = 20;

const getPlayersWithGames = async (pageParam: number, timestampFilters: GameFilter | undefined) => {
  const playersQuery = await request(INDEXER_ADDRESS, PLAYERS_QUERY, { first: PLAYERS_LIMIT, offset: pageParam });

  if (!playersQuery.allPlayers) return { playersWithGames: [], totalCount: 0 };

  const { nodes: players, totalCount } = playersQuery.allPlayers;
  const filter = { ...timestampFilters, or: players.map((player) => ({ playerAddress: { equalTo: player.id } })) };
  const gamesQuery = await request(INDEXER_ADDRESS, GAMES_QUERY, { filter });

  if (!gamesQuery.allGames) return { playersWithGames: [], totalCount: 0 };

  const { nodes: games } = gamesQuery.allGames;

  const playerAddressToGames = games.reduce(
    (acc, game) => {
      const { playerAddress } = game;

      if (!acc[playerAddress]) {
        acc[playerAddress] = [];
      }

      acc[playerAddress].push(game);

      return acc;
    },
    {} as Record<string, typeof games>,
  );

  const playersWithGames = players.map((player) => ({ ...player, games: playerAddressToGames[player.id] ?? [] }));

  return { playersWithGames, totalCount };
};

type PlayersWithGames = Awaited<ReturnType<typeof getPlayersWithGames>>;

const getNextPageParam = (data: PlayersWithGames, allPages: PlayersWithGames[]) => {
  if (!data.playersWithGames) throw new Error('No players found');

  const { totalCount } = data;
  const fetchedCount = allPages.length * PLAYERS_LIMIT;

  return fetchedCount < totalCount ? fetchedCount : undefined;
};

function usePlayers(filters: GameFilter | undefined) {
  return useInfiniteQuery({
    queryKey: ['players', filters],
    queryFn: async ({ pageParam }) => getPlayersWithGames(pageParam, filters),
    initialPageParam: 0,
    getNextPageParam,
    select: (data) => data.pages.flatMap((page) => page.playersWithGames ?? []),
  });
}

export { usePlayers };
