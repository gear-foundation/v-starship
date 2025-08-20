/**
 * @typedef {import('typeorm').MigrationInterface} MigrationInterface
 */

/**
 * @class
 * @implements {MigrationInterface}
 */
module.exports = class  $NAME1755694579727 {
    name = ' $NAME1755694579727'

    async up(queryRunner) {
        await queryRunner.query(`CREATE TABLE "player" ("id" character varying NOT NULL, "address" character varying NOT NULL, "score" integer NOT NULL, "ship_level" smallint NOT NULL, "name" character varying, CONSTRAINT "PK_65edadc946a7faf4b638d5e8885" PRIMARY KEY ("id"))`);
    }

    async down(queryRunner) {
        await queryRunner.query(`DROP TABLE "player"`);
    }
}
