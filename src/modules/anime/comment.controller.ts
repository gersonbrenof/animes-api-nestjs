import { Controller, Post, Body, Get, Param, Request, UseGuards, ParseIntPipe } from '@nestjs/common';
import { CommentService } from './comment.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
// import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Comentários') // Cria a seção no Swagger
@Controller('comments')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Post()
  @ApiOperation({ summary: 'Criar um comentário', description: 'Adiciona um comentário a um anime específico.' })
  @ApiResponse({ status: 201, description: 'Comentário criado com sucesso.' })
  @ApiResponse({ status: 404, description: 'Anime não encontrado.' })
  @ApiBearerAuth() // Indica que precisa de login
  // @UseGuards(JwtAuthGuard)
  async create(@Body() createCommentDto: CreateCommentDto, @Request() req) {
    // Pega o ID do usuário logado (ou 1 fixo para testes)
    const userId = req.user?.id || 1; 
    return this.commentService.create(createCommentDto, userId);
  }

  @Get('anime/:animeId')
  @ApiOperation({ summary: 'Listar comentários de um anime', description: 'Retorna todos os comentários de um anime, ordenados do mais recente para o mais antigo.' })
  @ApiParam({ name: 'animeId', example: 1, description: 'ID do anime' })
  @ApiResponse({ status: 200, description: 'Lista de comentários retornada.' })
  async findByAnime(@Param('animeId', ParseIntPipe) animeId: number) {
    return this.commentService.findByAnime(animeId);
  }
}