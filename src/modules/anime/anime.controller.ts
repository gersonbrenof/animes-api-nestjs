import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiParam } from '@nestjs/swagger';
import { AnimeService } from './anime.service';

@ApiTags('Anime')
@Controller('anime')
export class AnimeController {
  constructor(private readonly animeService: AnimeService) { }

  @Get('ranking')
  @ApiOperation({ summary: 'Listar recomendações do MyAnimeList' })
  @ApiQuery({ name: 'type', required: false, example: 'bypopularity' })
  async getRanking(@Query('type') type?: string) {
    return this.animeService.getMalRanking(type || 'all');
  }

  @Get('search')
  @ApiOperation({ summary: 'Pesquisar animes no MyAnimeList' })
  @ApiQuery({ name: 'titulo', required: true })
  async search(@Query('titulo') titulo: string) {
    return this.animeService.fetchMALData(titulo);
  }

  // 👇 NOVA ROTA: Filtro por Categoria/Gênero
  @Get('categoria')
  @ApiOperation({ summary: 'Listar os melhores animes por categoria/gênero' })
  @ApiQuery({
    name: 'genre',
    required: true,
    example: 'Romance',
    description: 'Nome do gênero em inglês (Ex: Action, Romance, Comedy, Drama, Isekai)'
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    example: 10,
    description: 'Quantidade de animes a retornar (Padrão: 10)'
  })
  async getPorCategoria(
    @Query('genre') genre: string,
    @Query('limit') limit?: number, // O Swagger/NestJS às vezes passa como string, então faremos o cast seguro no service, mas aqui tipamos como number
  ) {
    // Passamos o limite garantindo que seja um número (caso a query venha como string) e com fallback para 10
    const limiteFormatado = limit ? Number(limit) : 10;
    return this.animeService.getTopAnimesByCategory(genre, limiteFormatado);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar detalhes de um anime específico pelo ID' })
  @ApiParam({ name: 'id', required: true, example: 5114, description: 'ID do anime no MyAnimeList' })
  async getById(@Param('id', ParseIntPipe) id: number) {
    return this.animeService.getAnimeById(id);
  }

}