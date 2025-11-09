import { registerAs } from '@nestjs/config';
import * as dotenv from 'dotenv';

const envFilePath =
  process.env.NODE_ENV === 'production'
    ? '.env.production'
    : '.env.development';
dotenv.config({ path: envFilePath });

const config = {
  type: 'postgres',
  url: process.env.DB_URL,
  host: process.env.DB_HOST,
  port: +process.env.DB_PORT!,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: ['dist/**/*.entity{.ts,.js}'],
  migrations: ['dist/migrations/*{.ts,.js}'],
  autoLoadEntities: true,
  synchronize: true,
  dropschema: true,
  // ⚠️ solo en desarrollo
  ssl: {
    rejectUnauthorized: false, // importante para Render
  },
};

export default registerAs('typeorm', () => config);
