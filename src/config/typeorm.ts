import { registerAs } from '@nestjs/config';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.development' });

const config = {
  type: 'postgres',
  url: process.env.DB_URL,
  entities: ['dist/**/*.entity{.ts,.js}'],
  migrations: ['dist/migrations/*{.ts,.js}'],
  autoLoadEntities: true,
  synchronize: true, // ⚠️ solo en desarrollo
  ssl: {
    rejectUnauthorized: false, // importante para Render
  },
};

export default registerAs('typeorm', () => config);
