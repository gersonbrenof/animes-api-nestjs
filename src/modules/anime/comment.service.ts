import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from './entities/comment.entity';
import { CreateCommentDto } from './dto/create-comment.dto';
import { Anime } from './entities/anime.entity';

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepo: Repository<Comment>,
    @InjectRepository(Anime)
    private readonly animeRepo: Repository<Anime>,
  ) {}

  async create(createCommentDto: CreateCommentDto, userId: number) {
    const anime = await this.animeRepo.findOneBy({ id: createCommentDto.animeId });
    if (!anime) throw new NotFoundException('Anime não encontrado');

    const comment = this.commentRepo.create({
      content: createCommentDto.content,
      anime: anime,
      user: { id: userId } as any, // Vincula o ID do usuário logado
    });

    return await this.commentRepo.save(comment);
  }

  async findByAnime(animeId: number) {
    return await this.commentRepo.find({
      where: { anime: { id: animeId } },
      relations: ['user'], // Traz os dados de quem comentou
      order: { data_criacao: 'DESC' },
    });
  }
}