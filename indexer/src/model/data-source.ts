import { DataSource } from 'typeorm';
import dotenv from 'dotenv';
import { Player } from './entities';
import { config } from '../config';

dotenv.config();

const AppDataSource = new DataSource({
  type: 'postgres',
  url: config.dbUrl,
  synchronize: false,
  migrationsRun: true,
  logging: process.env.NODE_ENV === 'development',
  entities: [Player],
  migrations: ['db/migrations/*.js'],
});

export default AppDataSource;
