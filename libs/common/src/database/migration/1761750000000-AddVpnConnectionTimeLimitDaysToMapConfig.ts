import { MigrationInterface, QueryRunner } from "typeorm";

export class AddVpnConnectionTimeLimitDaysToMapConfig1761750000000 implements MigrationInterface {
    name = 'AddVpnConnectionTimeLimitDaysToMapConfig1761750000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "map_configs" ADD "vpn_connection_time_limit_days" integer DEFAULT 7`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "map_configs" DROP COLUMN "vpn_connection_time_limit_days"`);
    }
}

