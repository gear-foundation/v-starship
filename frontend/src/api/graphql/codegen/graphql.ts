/* eslint-disable */
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string };
  String: { input: string; output: string };
  Boolean: { input: boolean; output: boolean };
  Int: { input: number; output: number };
  Float: { input: number; output: number };
  /**
   * A signed eight-byte integer. The upper big integer values are greater than the
   * max value for a JavaScript number. Therefore all big integers will be output as
   * strings and not numbers.
   */
  BigInt: { input: any; output: any };
  /** A location in a connection that can be used for resuming pagination. */
  Cursor: { input: any; output: any };
  /**
   * A point in time as described by the [ISO
   * 8601](https://en.wikipedia.org/wiki/ISO_8601) standard. May or may not include a timezone.
   */
  Datetime: { input: string; output: string };
};

/** A filter to be used against BigInt fields. All fields are combined with a logical ‘and.’ */
export type BigIntFilter = {
  /** Not equal to the specified value, treating null like an ordinary value. */
  distinctFrom?: InputMaybe<Scalars['BigInt']['input']>;
  /** Equal to the specified value. */
  equalTo?: InputMaybe<Scalars['BigInt']['input']>;
  /** Greater than the specified value. */
  greaterThan?: InputMaybe<Scalars['BigInt']['input']>;
  /** Greater than or equal to the specified value. */
  greaterThanOrEqualTo?: InputMaybe<Scalars['BigInt']['input']>;
  /** Included in the specified list. */
  in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  /** Is null (if `true` is specified) or is not null (if `false` is specified). */
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  /** Less than the specified value. */
  lessThan?: InputMaybe<Scalars['BigInt']['input']>;
  /** Less than or equal to the specified value. */
  lessThanOrEqualTo?: InputMaybe<Scalars['BigInt']['input']>;
  /** Equal to the specified value, treating null like an ordinary value. */
  notDistinctFrom?: InputMaybe<Scalars['BigInt']['input']>;
  /** Not equal to the specified value. */
  notEqualTo?: InputMaybe<Scalars['BigInt']['input']>;
  /** Not included in the specified list. */
  notIn?: InputMaybe<Array<Scalars['BigInt']['input']>>;
};

/** A filter to be used against Datetime fields. All fields are combined with a logical ‘and.’ */
export type DatetimeFilter = {
  /** Not equal to the specified value, treating null like an ordinary value. */
  distinctFrom?: InputMaybe<Scalars['Datetime']['input']>;
  /** Equal to the specified value. */
  equalTo?: InputMaybe<Scalars['Datetime']['input']>;
  /** Greater than the specified value. */
  greaterThan?: InputMaybe<Scalars['Datetime']['input']>;
  /** Greater than or equal to the specified value. */
  greaterThanOrEqualTo?: InputMaybe<Scalars['Datetime']['input']>;
  /** Included in the specified list. */
  in?: InputMaybe<Array<Scalars['Datetime']['input']>>;
  /** Is null (if `true` is specified) or is not null (if `false` is specified). */
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  /** Less than the specified value. */
  lessThan?: InputMaybe<Scalars['Datetime']['input']>;
  /** Less than or equal to the specified value. */
  lessThanOrEqualTo?: InputMaybe<Scalars['Datetime']['input']>;
  /** Equal to the specified value, treating null like an ordinary value. */
  notDistinctFrom?: InputMaybe<Scalars['Datetime']['input']>;
  /** Not equal to the specified value. */
  notEqualTo?: InputMaybe<Scalars['Datetime']['input']>;
  /** Not included in the specified list. */
  notIn?: InputMaybe<Array<Scalars['Datetime']['input']>>;
};

export type Game = Node & {
  __typename?: 'Game';
  id: Scalars['String']['output'];
  /** A globally unique identifier. Can be used in various places throughout the system to identify this single value. */
  nodeId: Scalars['ID']['output'];
  playerAddress: Scalars['String']['output'];
  points: Scalars['Int']['output'];
  timestamp: Scalars['Datetime']['output'];
};

/** A condition to be used against `Game` object types. All fields are tested for equality and combined with a logical ‘and.’ */
export type GameCondition = {
  /** Checks for equality with the object’s `id` field. */
  id?: InputMaybe<Scalars['String']['input']>;
  /** Checks for equality with the object’s `playerAddress` field. */
  playerAddress?: InputMaybe<Scalars['String']['input']>;
  /** Checks for equality with the object’s `points` field. */
  points?: InputMaybe<Scalars['Int']['input']>;
  /** Checks for equality with the object’s `timestamp` field. */
  timestamp?: InputMaybe<Scalars['Datetime']['input']>;
};

/** A filter to be used against `Game` object types. All fields are combined with a logical ‘and.’ */
export type GameFilter = {
  /** Checks for all expressions in this list. */
  and?: InputMaybe<Array<GameFilter>>;
  /** Filter by the object’s `id` field. */
  id?: InputMaybe<StringFilter>;
  /** Negates the expression. */
  not?: InputMaybe<GameFilter>;
  /** Checks for any expressions in this list. */
  or?: InputMaybe<Array<GameFilter>>;
  /** Filter by the object’s `playerAddress` field. */
  playerAddress?: InputMaybe<StringFilter>;
  /** Filter by the object’s `points` field. */
  points?: InputMaybe<IntFilter>;
  /** Filter by the object’s `timestamp` field. */
  timestamp?: InputMaybe<DatetimeFilter>;
};

/** A connection to a list of `Game` values. */
export type GamesConnection = {
  __typename?: 'GamesConnection';
  /** A list of edges which contains the `Game` and cursor to aid in pagination. */
  edges: Array<GamesEdge>;
  /** A list of `Game` objects. */
  nodes: Array<Game>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  /** The count of *all* `Game` you could get from the connection. */
  totalCount: Scalars['Int']['output'];
};

/** A `Game` edge in the connection. */
export type GamesEdge = {
  __typename?: 'GamesEdge';
  /** A cursor for use in pagination. */
  cursor?: Maybe<Scalars['Cursor']['output']>;
  /** The `Game` at the end of the edge. */
  node: Game;
};

/** Methods to use when ordering `Game`. */
export enum GamesOrderBy {
  IdAsc = 'ID_ASC',
  IdDesc = 'ID_DESC',
  Natural = 'NATURAL',
  PlayerAddressAsc = 'PLAYER_ADDRESS_ASC',
  PlayerAddressDesc = 'PLAYER_ADDRESS_DESC',
  PointsAsc = 'POINTS_ASC',
  PointsDesc = 'POINTS_DESC',
  PrimaryKeyAsc = 'PRIMARY_KEY_ASC',
  PrimaryKeyDesc = 'PRIMARY_KEY_DESC',
  TimestampAsc = 'TIMESTAMP_ASC',
  TimestampDesc = 'TIMESTAMP_DESC',
}

/** A filter to be used against Int fields. All fields are combined with a logical ‘and.’ */
export type IntFilter = {
  /** Not equal to the specified value, treating null like an ordinary value. */
  distinctFrom?: InputMaybe<Scalars['Int']['input']>;
  /** Equal to the specified value. */
  equalTo?: InputMaybe<Scalars['Int']['input']>;
  /** Greater than the specified value. */
  greaterThan?: InputMaybe<Scalars['Int']['input']>;
  /** Greater than or equal to the specified value. */
  greaterThanOrEqualTo?: InputMaybe<Scalars['Int']['input']>;
  /** Included in the specified list. */
  in?: InputMaybe<Array<Scalars['Int']['input']>>;
  /** Is null (if `true` is specified) or is not null (if `false` is specified). */
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  /** Less than the specified value. */
  lessThan?: InputMaybe<Scalars['Int']['input']>;
  /** Less than or equal to the specified value. */
  lessThanOrEqualTo?: InputMaybe<Scalars['Int']['input']>;
  /** Equal to the specified value, treating null like an ordinary value. */
  notDistinctFrom?: InputMaybe<Scalars['Int']['input']>;
  /** Not equal to the specified value. */
  notEqualTo?: InputMaybe<Scalars['Int']['input']>;
  /** Not included in the specified list. */
  notIn?: InputMaybe<Array<Scalars['Int']['input']>>;
};

export type Leaderboard = {
  __typename?: 'Leaderboard';
  gamesPlayed?: Maybe<Scalars['Int']['output']>;
  points?: Maybe<Scalars['Int']['output']>;
  shipLevel?: Maybe<Scalars['Int']['output']>;
  userId?: Maybe<Scalars['String']['output']>;
  userName?: Maybe<Scalars['String']['output']>;
};

/** A filter to be used against `Leaderboard` object types. All fields are combined with a logical ‘and.’ */
export type LeaderboardFilter = {
  /** Checks for all expressions in this list. */
  and?: InputMaybe<Array<LeaderboardFilter>>;
  /** Filter by the object’s `gamesPlayed` field. */
  gamesPlayed?: InputMaybe<IntFilter>;
  /** Negates the expression. */
  not?: InputMaybe<LeaderboardFilter>;
  /** Checks for any expressions in this list. */
  or?: InputMaybe<Array<LeaderboardFilter>>;
  /** Filter by the object’s `points` field. */
  points?: InputMaybe<IntFilter>;
  /** Filter by the object’s `shipLevel` field. */
  shipLevel?: InputMaybe<IntFilter>;
  /** Filter by the object’s `userId` field. */
  userId?: InputMaybe<StringFilter>;
  /** Filter by the object’s `userName` field. */
  userName?: InputMaybe<StringFilter>;
};

/** A connection to a list of `Leaderboard` values. */
export type LeaderboardsConnection = {
  __typename?: 'LeaderboardsConnection';
  /** A list of edges which contains the `Leaderboard` and cursor to aid in pagination. */
  edges: Array<LeaderboardsEdge>;
  /** A list of `Leaderboard` objects. */
  nodes: Array<Leaderboard>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  /** The count of *all* `Leaderboard` you could get from the connection. */
  totalCount: Scalars['Int']['output'];
};

/** A `Leaderboard` edge in the connection. */
export type LeaderboardsEdge = {
  __typename?: 'LeaderboardsEdge';
  /** A cursor for use in pagination. */
  cursor?: Maybe<Scalars['Cursor']['output']>;
  /** The `Leaderboard` at the end of the edge. */
  node: Leaderboard;
};

export type Migration = Node & {
  __typename?: 'Migration';
  id: Scalars['Int']['output'];
  name: Scalars['String']['output'];
  /** A globally unique identifier. Can be used in various places throughout the system to identify this single value. */
  nodeId: Scalars['ID']['output'];
  timestamp: Scalars['BigInt']['output'];
};

/**
 * A condition to be used against `Migration` object types. All fields are tested
 * for equality and combined with a logical ‘and.’
 */
export type MigrationCondition = {
  /** Checks for equality with the object’s `id` field. */
  id?: InputMaybe<Scalars['Int']['input']>;
  /** Checks for equality with the object’s `name` field. */
  name?: InputMaybe<Scalars['String']['input']>;
  /** Checks for equality with the object’s `timestamp` field. */
  timestamp?: InputMaybe<Scalars['BigInt']['input']>;
};

/** A filter to be used against `Migration` object types. All fields are combined with a logical ‘and.’ */
export type MigrationFilter = {
  /** Checks for all expressions in this list. */
  and?: InputMaybe<Array<MigrationFilter>>;
  /** Filter by the object’s `id` field. */
  id?: InputMaybe<IntFilter>;
  /** Filter by the object’s `name` field. */
  name?: InputMaybe<StringFilter>;
  /** Negates the expression. */
  not?: InputMaybe<MigrationFilter>;
  /** Checks for any expressions in this list. */
  or?: InputMaybe<Array<MigrationFilter>>;
  /** Filter by the object’s `timestamp` field. */
  timestamp?: InputMaybe<BigIntFilter>;
};

/** A connection to a list of `Migration` values. */
export type MigrationsConnection = {
  __typename?: 'MigrationsConnection';
  /** A list of edges which contains the `Migration` and cursor to aid in pagination. */
  edges: Array<MigrationsEdge>;
  /** A list of `Migration` objects. */
  nodes: Array<Migration>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  /** The count of *all* `Migration` you could get from the connection. */
  totalCount: Scalars['Int']['output'];
};

/** A `Migration` edge in the connection. */
export type MigrationsEdge = {
  __typename?: 'MigrationsEdge';
  /** A cursor for use in pagination. */
  cursor?: Maybe<Scalars['Cursor']['output']>;
  /** The `Migration` at the end of the edge. */
  node: Migration;
};

/** Methods to use when ordering `Migration`. */
export enum MigrationsOrderBy {
  IdAsc = 'ID_ASC',
  IdDesc = 'ID_DESC',
  NameAsc = 'NAME_ASC',
  NameDesc = 'NAME_DESC',
  Natural = 'NATURAL',
  PrimaryKeyAsc = 'PRIMARY_KEY_ASC',
  PrimaryKeyDesc = 'PRIMARY_KEY_DESC',
  TimestampAsc = 'TIMESTAMP_ASC',
  TimestampDesc = 'TIMESTAMP_DESC',
}

/** An object with a globally unique `ID`. */
export type Node = {
  /** A globally unique identifier. Can be used in various places throughout the system to identify this single value. */
  nodeId: Scalars['ID']['output'];
};

/** Information about pagination in a connection. */
export type PageInfo = {
  __typename?: 'PageInfo';
  /** When paginating forwards, the cursor to continue. */
  endCursor?: Maybe<Scalars['Cursor']['output']>;
  /** When paginating forwards, are there more items? */
  hasNextPage: Scalars['Boolean']['output'];
  /** When paginating backwards, are there more items? */
  hasPreviousPage: Scalars['Boolean']['output'];
  /** When paginating backwards, the cursor to continue. */
  startCursor?: Maybe<Scalars['Cursor']['output']>;
};

export type Player = Node & {
  __typename?: 'Player';
  id: Scalars['String']['output'];
  name?: Maybe<Scalars['String']['output']>;
  /** A globally unique identifier. Can be used in various places throughout the system to identify this single value. */
  nodeId: Scalars['ID']['output'];
  score: Scalars['Int']['output'];
  shipLevel: Scalars['Int']['output'];
};

/** A condition to be used against `Player` object types. All fields are tested for equality and combined with a logical ‘and.’ */
export type PlayerCondition = {
  /** Checks for equality with the object’s `id` field. */
  id?: InputMaybe<Scalars['String']['input']>;
  /** Checks for equality with the object’s `name` field. */
  name?: InputMaybe<Scalars['String']['input']>;
  /** Checks for equality with the object’s `score` field. */
  score?: InputMaybe<Scalars['Int']['input']>;
  /** Checks for equality with the object’s `shipLevel` field. */
  shipLevel?: InputMaybe<Scalars['Int']['input']>;
};

/** A filter to be used against `Player` object types. All fields are combined with a logical ‘and.’ */
export type PlayerFilter = {
  /** Checks for all expressions in this list. */
  and?: InputMaybe<Array<PlayerFilter>>;
  /** Filter by the object’s `id` field. */
  id?: InputMaybe<StringFilter>;
  /** Filter by the object’s `name` field. */
  name?: InputMaybe<StringFilter>;
  /** Negates the expression. */
  not?: InputMaybe<PlayerFilter>;
  /** Checks for any expressions in this list. */
  or?: InputMaybe<Array<PlayerFilter>>;
  /** Filter by the object’s `score` field. */
  score?: InputMaybe<IntFilter>;
  /** Filter by the object’s `shipLevel` field. */
  shipLevel?: InputMaybe<IntFilter>;
};

/** A connection to a list of `Player` values. */
export type PlayersConnection = {
  __typename?: 'PlayersConnection';
  /** A list of edges which contains the `Player` and cursor to aid in pagination. */
  edges: Array<PlayersEdge>;
  /** A list of `Player` objects. */
  nodes: Array<Player>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  /** The count of *all* `Player` you could get from the connection. */
  totalCount: Scalars['Int']['output'];
};

/** A `Player` edge in the connection. */
export type PlayersEdge = {
  __typename?: 'PlayersEdge';
  /** A cursor for use in pagination. */
  cursor?: Maybe<Scalars['Cursor']['output']>;
  /** The `Player` at the end of the edge. */
  node: Player;
};

/** Methods to use when ordering `Player`. */
export enum PlayersOrderBy {
  IdAsc = 'ID_ASC',
  IdDesc = 'ID_DESC',
  NameAsc = 'NAME_ASC',
  NameDesc = 'NAME_DESC',
  Natural = 'NATURAL',
  PrimaryKeyAsc = 'PRIMARY_KEY_ASC',
  PrimaryKeyDesc = 'PRIMARY_KEY_DESC',
  ScoreAsc = 'SCORE_ASC',
  ScoreDesc = 'SCORE_DESC',
  ShipLevelAsc = 'SHIP_LEVEL_ASC',
  ShipLevelDesc = 'SHIP_LEVEL_DESC',
}

/** The root query type which gives access points into the data universe. */
export type Query = Node & {
  __typename?: 'Query';
  /** Reads and enables pagination through a set of `Game`. */
  allGames?: Maybe<GamesConnection>;
  /** Reads and enables pagination through a set of `Migration`. */
  allMigrations?: Maybe<MigrationsConnection>;
  /** Reads and enables pagination through a set of `Player`. */
  allPlayers?: Maybe<PlayersConnection>;
  /** Reads a single `Game` using its globally unique `ID`. */
  game?: Maybe<Game>;
  gameById?: Maybe<Game>;
  /** Reads and enables pagination through a set of `Leaderboard`. */
  leaderboardByDates?: Maybe<LeaderboardsConnection>;
  /** Reads a single `Migration` using its globally unique `ID`. */
  migration?: Maybe<Migration>;
  migrationById?: Maybe<Migration>;
  /** Fetches an object given its globally unique `ID`. */
  node?: Maybe<Node>;
  /** The root query type must be a `Node` to work well with Relay 1 mutations. This just resolves to `query`. */
  nodeId: Scalars['ID']['output'];
  /** Reads a single `Player` using its globally unique `ID`. */
  player?: Maybe<Player>;
  playerById?: Maybe<Player>;
  /**
   * Exposes the root query type nested one level down. This is helpful for Relay 1
   * which can only query top level fields if they are in a particular form.
   */
  query: Query;
};

/** The root query type which gives access points into the data universe. */
export type QueryAllGamesArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  condition?: InputMaybe<GameCondition>;
  filter?: InputMaybe<GameFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<GamesOrderBy>>;
};

/** The root query type which gives access points into the data universe. */
export type QueryAllMigrationsArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  condition?: InputMaybe<MigrationCondition>;
  filter?: InputMaybe<MigrationFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<MigrationsOrderBy>>;
};

/** The root query type which gives access points into the data universe. */
export type QueryAllPlayersArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  condition?: InputMaybe<PlayerCondition>;
  filter?: InputMaybe<PlayerFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<PlayersOrderBy>>;
};

/** The root query type which gives access points into the data universe. */
export type QueryGameArgs = {
  nodeId: Scalars['ID']['input'];
};

/** The root query type which gives access points into the data universe. */
export type QueryGameByIdArgs = {
  id: Scalars['String']['input'];
};

/** The root query type which gives access points into the data universe. */
export type QueryLeaderboardByDatesArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<LeaderboardFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  from?: InputMaybe<Scalars['Datetime']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  to?: InputMaybe<Scalars['Datetime']['input']>;
};

/** The root query type which gives access points into the data universe. */
export type QueryMigrationArgs = {
  nodeId: Scalars['ID']['input'];
};

/** The root query type which gives access points into the data universe. */
export type QueryMigrationByIdArgs = {
  id: Scalars['Int']['input'];
};

/** The root query type which gives access points into the data universe. */
export type QueryNodeArgs = {
  nodeId: Scalars['ID']['input'];
};

/** The root query type which gives access points into the data universe. */
export type QueryPlayerArgs = {
  nodeId: Scalars['ID']['input'];
};

/** The root query type which gives access points into the data universe. */
export type QueryPlayerByIdArgs = {
  id: Scalars['String']['input'];
};

/** A filter to be used against String fields. All fields are combined with a logical ‘and.’ */
export type StringFilter = {
  /** Not equal to the specified value, treating null like an ordinary value. */
  distinctFrom?: InputMaybe<Scalars['String']['input']>;
  /** Not equal to the specified value, treating null like an ordinary value (case-insensitive). */
  distinctFromInsensitive?: InputMaybe<Scalars['String']['input']>;
  /** Ends with the specified string (case-sensitive). */
  endsWith?: InputMaybe<Scalars['String']['input']>;
  /** Ends with the specified string (case-insensitive). */
  endsWithInsensitive?: InputMaybe<Scalars['String']['input']>;
  /** Equal to the specified value. */
  equalTo?: InputMaybe<Scalars['String']['input']>;
  /** Equal to the specified value (case-insensitive). */
  equalToInsensitive?: InputMaybe<Scalars['String']['input']>;
  /** Greater than the specified value. */
  greaterThan?: InputMaybe<Scalars['String']['input']>;
  /** Greater than the specified value (case-insensitive). */
  greaterThanInsensitive?: InputMaybe<Scalars['String']['input']>;
  /** Greater than or equal to the specified value. */
  greaterThanOrEqualTo?: InputMaybe<Scalars['String']['input']>;
  /** Greater than or equal to the specified value (case-insensitive). */
  greaterThanOrEqualToInsensitive?: InputMaybe<Scalars['String']['input']>;
  /** Included in the specified list. */
  in?: InputMaybe<Array<Scalars['String']['input']>>;
  /** Included in the specified list (case-insensitive). */
  inInsensitive?: InputMaybe<Array<Scalars['String']['input']>>;
  /** Contains the specified string (case-sensitive). */
  includes?: InputMaybe<Scalars['String']['input']>;
  /** Contains the specified string (case-insensitive). */
  includesInsensitive?: InputMaybe<Scalars['String']['input']>;
  /** Is null (if `true` is specified) or is not null (if `false` is specified). */
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  /** Less than the specified value. */
  lessThan?: InputMaybe<Scalars['String']['input']>;
  /** Less than the specified value (case-insensitive). */
  lessThanInsensitive?: InputMaybe<Scalars['String']['input']>;
  /** Less than or equal to the specified value. */
  lessThanOrEqualTo?: InputMaybe<Scalars['String']['input']>;
  /** Less than or equal to the specified value (case-insensitive). */
  lessThanOrEqualToInsensitive?: InputMaybe<Scalars['String']['input']>;
  /** Matches the specified pattern (case-sensitive). An underscore (_) matches any single character; a percent sign (%) matches any sequence of zero or more characters. */
  like?: InputMaybe<Scalars['String']['input']>;
  /** Matches the specified pattern (case-insensitive). An underscore (_) matches any single character; a percent sign (%) matches any sequence of zero or more characters. */
  likeInsensitive?: InputMaybe<Scalars['String']['input']>;
  /** Equal to the specified value, treating null like an ordinary value. */
  notDistinctFrom?: InputMaybe<Scalars['String']['input']>;
  /** Equal to the specified value, treating null like an ordinary value (case-insensitive). */
  notDistinctFromInsensitive?: InputMaybe<Scalars['String']['input']>;
  /** Does not end with the specified string (case-sensitive). */
  notEndsWith?: InputMaybe<Scalars['String']['input']>;
  /** Does not end with the specified string (case-insensitive). */
  notEndsWithInsensitive?: InputMaybe<Scalars['String']['input']>;
  /** Not equal to the specified value. */
  notEqualTo?: InputMaybe<Scalars['String']['input']>;
  /** Not equal to the specified value (case-insensitive). */
  notEqualToInsensitive?: InputMaybe<Scalars['String']['input']>;
  /** Not included in the specified list. */
  notIn?: InputMaybe<Array<Scalars['String']['input']>>;
  /** Not included in the specified list (case-insensitive). */
  notInInsensitive?: InputMaybe<Array<Scalars['String']['input']>>;
  /** Does not contain the specified string (case-sensitive). */
  notIncludes?: InputMaybe<Scalars['String']['input']>;
  /** Does not contain the specified string (case-insensitive). */
  notIncludesInsensitive?: InputMaybe<Scalars['String']['input']>;
  /** Does not match the specified pattern (case-sensitive). An underscore (_) matches any single character; a percent sign (%) matches any sequence of zero or more characters. */
  notLike?: InputMaybe<Scalars['String']['input']>;
  /** Does not match the specified pattern (case-insensitive). An underscore (_) matches any single character; a percent sign (%) matches any sequence of zero or more characters. */
  notLikeInsensitive?: InputMaybe<Scalars['String']['input']>;
  /** Does not start with the specified string (case-sensitive). */
  notStartsWith?: InputMaybe<Scalars['String']['input']>;
  /** Does not start with the specified string (case-insensitive). */
  notStartsWithInsensitive?: InputMaybe<Scalars['String']['input']>;
  /** Starts with the specified string (case-sensitive). */
  startsWith?: InputMaybe<Scalars['String']['input']>;
  /** Starts with the specified string (case-insensitive). */
  startsWithInsensitive?: InputMaybe<Scalars['String']['input']>;
};

export type LeaderboardQueryQueryVariables = Exact<{
  first: Scalars['Int']['input'];
  offset: Scalars['Int']['input'];
  from?: InputMaybe<Scalars['Datetime']['input']>;
  to?: InputMaybe<Scalars['Datetime']['input']>;
}>;

export type LeaderboardQueryQuery = {
  __typename?: 'Query';
  leaderboardByDates?: {
    __typename?: 'LeaderboardsConnection';
    totalCount: number;
    nodes: Array<{
      __typename?: 'Leaderboard';
      gamesPlayed?: number | null;
      points?: number | null;
      userId?: string | null;
      userName?: string | null;
      shipLevel?: number | null;
    }>;
  } | null;
};

export const LeaderboardQueryDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'LeaderboardQuery' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'first' } },
          type: { kind: 'NonNullType', type: { kind: 'NamedType', name: { kind: 'Name', value: 'Int' } } },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'offset' } },
          type: { kind: 'NonNullType', type: { kind: 'NamedType', name: { kind: 'Name', value: 'Int' } } },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'from' } },
          type: { kind: 'NamedType', name: { kind: 'Name', value: 'Datetime' } },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'to' } },
          type: { kind: 'NamedType', name: { kind: 'Name', value: 'Datetime' } },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'leaderboardByDates' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'first' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'first' } },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'offset' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'offset' } },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'from' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'from' } },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'to' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'to' } },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'nodes' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'gamesPlayed' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'points' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'userId' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'userName' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'shipLevel' } },
                    ],
                  },
                },
                { kind: 'Field', name: { kind: 'Name', value: 'totalCount' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<LeaderboardQueryQuery, LeaderboardQueryQueryVariables>;
