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
        "ship_level" smallint,
        "games_played" integer
      );`
    );

    await queryRunner.query(
      `CREATE FUNCTION leaderboard_by_dates(
        "from" TIMESTAMP WITH TIME ZONE DEFAULT NULL,
        "to" TIMESTAMP WITH TIME ZONE DEFAULT NULL
      )
      RETURNS SETOF leaderboard AS $$
        SELECT
          SUM(g.points) AS points,
          p.id AS user_id,
          p.name AS user_name,
          p.ship_level as ship_level,
          COUNT(*) AS games_played
          FROM player AS p
          INNER JOIN game AS g ON g.player_address = p.id
          WHERE
            ("from" IS NULL OR g.timestamp >= "from") AND
            ("to" IS NULL OR g.timestamp <= "to")
          GROUP BY p.id
          ORDER BY points DESC
      $$ LANGUAGE sql STABLE;`
    );
  }

  async down(queryRunner) {
    await queryRunner.query(`DROP TABLE "game"`);
  }
};
