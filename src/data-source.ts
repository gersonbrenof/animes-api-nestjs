import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { join } from 'path';

dotenv.config();

export const AppDataSource = new DataSource({
  type: 'sqlite',
  database: 'anime_db.sqlite',
  // 👇 Mudança importante: Usar caminho de texto evita erro de importação no CLI
  entities: [join(__dirname, '**', '*.entity.{ts,js}')],
  synchronize: false,
  logging: true,
});