import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from './entities/comment.entity';
import { CreateCommentDto } from './dto/create-comment.dto';

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepo: Repository<Comment>,
    // ❌ animeRepo removido daqui!
  ) {}

  async create(createCommentDto: CreateCommentDto, userId: number) {
    // createCommentDto.animeId agora é o ID do MAL (ex: 34572)
    const comment = this.commentRepo.create({
      content: createCommentDto.content,
      animeId: createCommentDto.animeId, // Salva o ID do MAL direto
      user: { id: userId } as any, // Vincula o usuário logado
    });

    return await this.commentRepo.save(comment);
  }

  // Busca todos os comentários do seu banco usando o ID do MyAnimeList
  async findByAnime(animeId: number) {
    return await this.commentRepo.find({
      where: { animeId: animeId },
      relations: ['user'], 
      // 👇 Adicione este bloco 'select'
      select: {
        id: true,
        content: true,
        animeId: true,
        data_criacao: true,
        user: {
          id: true,
          email: true, // Traz apenas o ID e o Email! Ignora password e role.
        }
      },
      order: { data_criacao: 'DESC' },
    });
  }
}