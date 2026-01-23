import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

import { AnimeModule } from './modules/anime/anime.module';
import { UserModule } from './modules/user/user.module';
import { AuthModule } from './modules/auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
    }),
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'anime_db.sqlite',
      // 🔹 REMOVA o array fixo de entities: [Anime, User]
      // 🔹 ADICIONE estas duas linhas:
      autoLoadEntities: true, // Faz o Nest carregar automaticamente tudo que estiver no forFeature dos módulos
      synchronize: true,      // Mude para TRUE para o SQLite criar as tabelas de comentário e avaliação
    }),
    AnimeModule,
    UserModule,
    AuthModule,
  ],
})
export class AppModule { }