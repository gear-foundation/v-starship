import { useInfiniteQuery } from '@tanstack/react-query';
// import { request } from 'graphql-request';

// import { graphql } from './codegen';
import { PlayersQueryQuery } from './codegen/graphql';

// const INDEXER_ADDRESS = import.meta.env.VITE_INDEXER_ADDRESS as string;

// const PLAYERS_QUERY = graphql(`
//   query PlayersQuery($first: Int!, $offset: Int!) {
//     allPlayers(first: $first, offset: $offset, orderBy: SCORE_DESC) {
//       nodes {
//         id
//         address
//         name
//         shipLevel
//         score
//       }

//       totalCount
//     }
//   }
// `);

const PLAYERS_LIMIT = 20;

const getNextPageParam = (data: PlayersQueryQuery, allPages: PlayersQueryQuery[]) => {
  if (!data.allPlayers) throw new Error('No players found');

  const { totalCount } = data.allPlayers;
  const fetchedCount = allPages.length * PLAYERS_LIMIT;

  return fetchedCount < totalCount ? fetchedCount : undefined;
};

// function usePlayers() {
//   return useInfiniteQuery({
//     queryKey: ['players'],
//     queryFn: ({ pageParam }) => request(INDEXER_ADDRESS, PLAYERS_QUERY, { first: PLAYERS_LIMIT, offset: pageParam }),
//     initialPageParam: 0,
//     getNextPageParam,
//     select: (data) => data.pages.flatMap((page) => page.allPlayers?.nodes ?? []),
//   });
// }

// export { usePlayers };

const generateMockPlayer = (id: number) => ({
  id: `player-${id}`,
  address: `0x${id.toString(16).padStart(40, '0')}`,
  name: `Player${id}`,
  shipLevel: Math.floor(Math.random() * 10) + 1,
  score: Math.max(0, 10000 - id * 100 + Math.floor(Math.random() * 200)),
});

const MOCK_TOTAL_PLAYERS = 50; // 5 pages worth of data

export function createMockPlayersQuery() {
  const allMockPlayers = Array.from({ length: MOCK_TOTAL_PLAYERS }, (_, i) => generateMockPlayer(i + 1)).sort(
    (a, b) => b.score - a.score,
  ); // Sort by score descending

  return ({ first, offset }: { first: number; offset: number }): PlayersQueryQuery => {
    const nodes = allMockPlayers.slice(offset, offset + first);

    return {
      allPlayers: {
        nodes,
        totalCount: MOCK_TOTAL_PLAYERS,
      },
    };
  };
}

function usePlayers() {
  const mockQueryFn = createMockPlayersQuery();

  return useInfiniteQuery({
    queryKey: ['leaderboard-mock'],
    queryFn: ({ pageParam }) => {
      return new Promise<PlayersQueryQuery>((resolve) => {
        setTimeout(() => {
          resolve(mockQueryFn({ first: PLAYERS_LIMIT, offset: pageParam }));
        }, 2000);
      });
    },
    initialPageParam: 0,
    getNextPageParam,
    select: (data) => data.pages.flatMap((page) => page.allPlayers?.nodes ?? []),
  });
}

export { usePlayers };
