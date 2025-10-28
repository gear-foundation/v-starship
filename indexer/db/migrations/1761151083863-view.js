/**
 * @typedef {import('typeorm').MigrationInterface} MigrationInterface
 */

/**
 * @class
 * @implements {MigrationInterface}
 */
module.exports = class View1761151083863 {
  name = 'View1761151083863';

  async up(queryRunner) {
    await queryRunner.query(
      `CREATE TYPE leaderboard AS (
        "points" integer,
        "user_id" character varying,
        "user_name" character varying,
        "games_played" integer
      );`
    );

    await queryRunner.query(
      `CREATE FUNCTION leaderboard_by_dates(
        "from" TIMESTAMP WITH TIME ZONE,
        "to" TIMESTAMP WITH TIME ZONE
      )
      RETURNS SETOF leaderboard AS $$
        SELECT
          ROW_NUMBER() OVER (ORDER BY SUM(g.points) DESC) AS points,
          p.id AS user_id,
          p.name AS user_name,
          COUNT(*) AS games_played
          FROM player AS p
          INNER JOIN game AS g ON g.player_address = p.id
          WHERE g.timestamp >= "from" AND g.timestamp <= "to"
          GROUP BY p.id
          ORDER BY points DESC
      $$ LANGUAGE sql STABLE;`
    );
  }

  async down(queryRunner) {
    await queryRunner.query(`DROP TABLE "game"`);
  }
};
