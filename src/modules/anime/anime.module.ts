import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';

// Imports de Anime
import { AnimeService } from './anime.service';
import { AnimeController } from './anime.controller';
import { Anime } from './entities/anime.entity';

// Imports de Evaluation
import { Evaluation } from './entities/evaluation.entity';
import { EvaluationService } from './evaluation.service';
import { EvaluationController } from './evaluation.controller';

// Imports de Comment
import { Comment } from './entities/comment.entity';
import { CommentController } from './comment.controller';
import { CommentService } from './comment.service'; // <--- 1. Importe o Service aqui

@Module({
  imports: [
    TypeOrmModule.forFeature([Anime, Comment, Evaluation]),
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
    CommentController
  ], 
  providers: [
    AnimeService, 
    EvaluationService, 
    CommentService
  ],
  exports: [AnimeService],
})
export class AnimeModule { }