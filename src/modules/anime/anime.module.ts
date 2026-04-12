import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { HttpModule } from '@nestjs/axios'; // 1. Importe o HttpModule
import { ConfigModule } from '@nestjs/config'; // Importe para ler o .env
import { diskStorage } from 'multer';

import { AnimeService } from './anime.service';
import { AnimeController } from './anime.controller';


import { Evaluation } from './entities/evaluation.entity';
import { EvaluationService } from './evaluation.service';
import { EvaluationController } from './evaluation.controller';

import { Comment } from './entities/comment.entity';
import { CommentController } from './comment.controller';
import { CommentService } from './comment.service';
import { WatchLaterController } from './WatchLaterControlle';
import { WatchLaterService } from './watch-later.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([ Comment, Evaluation]),
    HttpModule, // <--- ADICIONE ISSO para a integração com MAL funcionar
    ConfigModule, // Garante que o ConfigService funcione
    MulterModule.register({
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          cb(null, file.originalname);
        },
      }),
    }),
  ],
  controllers: [
    AnimeController, 
    EvaluationController, 
    CommentController,
    WatchLaterController
  ], 
  providers: [
    AnimeService, 
    EvaluationService, 
    CommentService,
    WatchLaterService
  ],
  exports: [AnimeService],
})
export class AnimeModule { }