import { registerAs } from '@nestjs/config';
import * as dotenv from 'dotenv';
dotenv.config();

const config = {
  type: 'postgres',
  url:
    process.env.DATABASE_URL ||
    'postgres://postgres:password@localhost:5432/mi_db', // URL completa
  entities: ['dist/**/*.entity{.ts,.js}'],
  migrations: ['dist/migrations/*{.ts,.js}'],
  synchronize: true, // solo para demo
  dropSchema: true, // opcional: resetea la DB en cada deploy
};

export default registerAs('typeorm', () => config);
