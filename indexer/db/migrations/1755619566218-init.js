/**
 * @typedef {import('typeorm').MigrationInterface} MigrationInterface
 */

/**
 * @class
 * @implements {MigrationInterface}
 */
module.exports = class Init1755619566218 {
    name = 'Init1755619566218'

    async up(queryRunner) {
        await queryRunner.query(`CREATE TABLE "player" ("id" character varying NOT NULL, "score" integer NOT NULL, CONSTRAINT "PK_65edadc946a7faf4b638d5e8885" PRIMARY KEY ("id"))`);
    }

    async down(queryRunner) {
        await queryRunner.query(`DROP TABLE "player"`);
    }
}
