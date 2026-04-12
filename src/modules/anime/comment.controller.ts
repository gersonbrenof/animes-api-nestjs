import { Controller, Get, Post, Body, Param, UseGuards, Req, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CommentService } from './comment.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard'; // Verifique o caminho

@ApiTags('Comments')
@Controller('comments')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  // 🔓 PÚBLICO: Ver os comentários de um anime específico do MAL
  @Get('anime/:animeId')
  @ApiOperation({ summary: 'Listar comentários de um anime do MyAnimeList' })
  async findByAnime(@Param('animeId', ParseIntPipe) animeId: number) {
    return this.commentService.findByAnime(animeId);
  }

  // 🔒 PROTEGIDO: Criar um comentário (Usuário precisa estar logado)
  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Adicionar comentário em um anime' })
  async create(@Body() createCommentDto: CreateCommentDto, @Req() req: any) {
    // Pega o ID do usuário que o JwtAuthGuard injetou na requisição
    const userId = req.user.userId || req.user.id; 
    return this.commentService.create(createCommentDto, userId);
  }
}