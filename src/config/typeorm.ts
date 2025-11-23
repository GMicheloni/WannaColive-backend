import { registerAs } from '@nestjs/config';
import * as dotenv from 'dotenv';

const envFilePath =
  process.env.NODE_ENV === 'production'
    ? '.env.production'
    : '.env.development';

dotenv.config({ path: envFilePath });

const isProd = process.env.NODE_ENV === 'production';

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

  // Solo sincroniza y dropea el esquema en desarrollo
  synchronize: !isProd,
  /* dropSchema: !isProd, */

  // Solo activa SSL en producción
  ssl: isProd
    ? { rejectUnauthorized: false }
    : false,
};

export default registerAs('typeorm', () => config);
