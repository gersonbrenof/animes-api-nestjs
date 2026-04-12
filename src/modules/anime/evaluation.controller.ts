import { Controller, Get, Post, Body, Param, UseGuards, Req, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { EvaluationService } from './evaluation.service';
import { CreateEvaluationDto } from './dto/create-evaluation.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Evaluations')
@Controller('evaluations')
export class EvaluationController {
  constructor(private readonly evaluationService: EvaluationService) {}

  // 🔓 PÚBLICO: Ver as notas de um anime específico
  @Get('anime/:animeId')
  @ApiOperation({ summary: 'Ver as avaliações e média de notas de um anime' })
  async findByAnime(@Param('animeId', ParseIntPipe) animeId: number) {
    return this.evaluationService.findByAnime(animeId);
  }

  // 🔒 PROTEGIDO: Dar uma nota (Usuário precisa estar logado)
  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Avaliar um anime' })
  async create(@Body() createEvaluationDto: CreateEvaluationDto, @Req() req: any) {
    const userId = req.user.userId || req.user.id;
    return this.evaluationService.create(createEvaluationDto, userId);
  }
}