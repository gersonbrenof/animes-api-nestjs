import { Controller, Post, Body, Get, Param, Request, UseGuards, ParseIntPipe } from '@nestjs/common';
import { EvaluationService } from './evaluation.service';
import { CreateEvaluationDto } from './dto/create-evaluation.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth } from '@nestjs/swagger';

import { JwtAuthGuard } from '../auth/jwt-auth.guard'; 

@ApiTags('Avaliações') 
@Controller('evaluations')
export class EvaluationController {
  constructor(private readonly evaluationService: EvaluationService) {}

  @Post()
  @ApiOperation({ summary: 'Avaliar um anime', description: 'Requer token JWT. Cria ou atualiza a nota do usuário.' })
  @ApiResponse({ status: 201, description: 'Avaliação salva com sucesso.' })
  @ApiResponse({ status: 401, description: 'Não autorizado (falta token).' }) // Documentando o erro de login
  @ApiBearerAuth() // 🔒 Ícone de cadeado no Swagger
  @UseGuards(JwtAuthGuard) // 🔒 Bloqueia a rota se não estiver logado
  async create(@Body() createEvaluationDto: CreateEvaluationDto, @Request() req) {
  
    const userId = req.user.id; 
    
    return this.evaluationService.rateAnime(createEvaluationDto, userId);
  }

  // A rota de média PODE ser pública (sem @UseGuards), pois qualquer um pode ver a nota
  @Get('average/:animeId')
  @ApiOperation({ summary: 'Obter média de notas' })
  @ApiParam({ name: 'animeId', example: 1 })
  async getAverage(@Param('animeId', ParseIntPipe) animeId: number) {
    const average = await this.evaluationService.getAnimeAverage(animeId);
    return {
      animeId: animeId,
      average: average,
    };
  }
}