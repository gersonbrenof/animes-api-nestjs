import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Evaluation } from './entities/evaluation.entity';
import { CreateEvaluationDto } from './dto/create-evaluation.dto';
import { Anime } from './entities/anime.entity';

@Injectable()
export class EvaluationService {
  constructor(
    @InjectRepository(Evaluation)
    private readonly evaluationRepo: Repository<Evaluation>,
    @InjectRepository(Anime)
    private readonly animeRepo: Repository<Anime>,
  ) {}

  async rateAnime(dto: CreateEvaluationDto, userId: number) {
    const anime = await this.animeRepo.findOneBy({ id: dto.animeId });
    if (!anime) throw new NotFoundException('Anime não encontrado');

    // Verifica se o usuário já avaliou antes
    const existingEvaluation = await this.evaluationRepo.findOne({
      where: {
        anime: { id: dto.animeId },
        user: { id: userId } as any,
      },
    });

    if (existingEvaluation) {
      // Atualiza a avaliação existente
      existingEvaluation.rating = dto.rating;
      return await this.evaluationRepo.save(existingEvaluation);
    } else {
      // Cria uma nova avaliação
      const evaluation = this.evaluationRepo.create({
        rating: dto.rating,
        anime: anime,
        user: { id: userId } as any, // Vincula o ID do usuário logado
      });
      return await this.evaluationRepo.save(evaluation);
    }
  }

  // Método para calcular a média
  async getAnimeAverage(animeId: number): Promise<number> {
    const { average } = await this.evaluationRepo
      .createQueryBuilder('eval')
      .select('AVG(eval.rating)', 'average')
      .where('eval.animeId = :animeId', { animeId })
      .getRawOne();

    // Retorna a média formatada (opcional: ou null se não houver notas)
    return parseFloat(average) || 0;
  }
}