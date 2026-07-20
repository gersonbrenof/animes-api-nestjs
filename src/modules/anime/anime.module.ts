import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { diskStorage } from 'multer';

import { AnimeService } from './anime.service';
import { AnimeController } from './anime.controller';

import { Evaluation } from './entities/evaluation.entity';
import { EvaluationService } from './evaluation.service';
import { EvaluationController } from './evaluation.controller';

import { Comment } from './entities/comment.entity';
import { CommentController } from './comment.controller';
import { CommentService } from './comment.service';

// Importe a Entidade e o Controller corrigido
import { WatchLater } from './entities/watch-later.entity'; // Certifique-se de importar a entidade
import { WatchLaterController } from './WatchLaterControlle';
import { WatchLaterService } from './watch-later.service';

@Module({
  imports: [
    // ✅ ADICIONADO: WatchLater incluído aqui para o repositório funcionar
    TypeOrmModule.forFeature([Comment, Evaluation, WatchLater]), 
    
    HttpModule,
    ConfigModule,
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
  exports: [AnimeService, WatchLaterService], // ✅ Exportado para poder usar em outros módulos se precisar
})
export class AnimeModule { }