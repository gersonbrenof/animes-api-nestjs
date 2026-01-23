import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express'; // 🔹 Importar Multer
import { diskStorage } from 'multer'; // 🔹 Importar diskStorage para controlar o nome
import { AnimeService } from './anime.service';
import { AnimeController } from './anime.controller';
import { Anime } from './entities/anime.entity';
import { Evaluation } from './entities/evaluation.entity';
import { Comment } from './entities/comment.entity'; 
@Module({
  imports: [
    TypeOrmModule.forFeature([Anime, Comment, Evaluation]),
    MulterModule.register({
      storage: diskStorage({
        destination: './uploads', // Pasta onde vai salvar
        filename: (req, file, cb) => {
          // Salva com o nome original (ex: naruto.jpg) para bater com seu Controller
          cb(null, file.originalname);
        },
      }),
    }),
    // -----------------------------
  ],
  controllers: [AnimeController],
  providers: [AnimeService],
  exports: [AnimeService],
})
export class AnimeModule { }