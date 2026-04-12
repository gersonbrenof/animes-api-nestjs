import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Evaluation } from './entities/evaluation.entity';
import { CreateEvaluationDto } from './dto/create-evaluation.dto';

@Injectable()
export class EvaluationService {
  constructor(
    @InjectRepository(Evaluation)
    private readonly evaluationRepo: Repository<Evaluation>,
  ) {}

  async create(createEvaluationDto: CreateEvaluationDto, userId: number) {
    const evaluation = this.evaluationRepo.create({
      nota: createEvaluationDto.nota,
      animeId: createEvaluationDto.animeId, // Salva o ID do MAL direto
      user: { id: userId } as any, // Vincula o ID do usuário logado
    });

    return await this.evaluationRepo.save(evaluation);
  }

  // Busca a média e todas as avaliações de um anime específico do MAL
  async findByAnime(animeId: number) {
    const avaliacoes = await this.evaluationRepo.find({
      where: { animeId: animeId },
      relations: ['user'],
      order: { data_criacao: 'DESC' },
    });

    // Bônus: Já calcula a média das notas para você mandar pro frontend!
    const media = avaliacoes.length > 0 
      ? avaliacoes.reduce((acc, aval) => acc + aval.nota, 0) / avaliacoes.length 
      : 0;

    return { media: media.toFixed(2), total_avaliacoes: avaliacoes.length, avaliacoes };
  }
}