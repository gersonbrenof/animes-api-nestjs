import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiParam } from '@nestjs/swagger';
import { AnimeService } from './anime.service';

@ApiTags('Anime')
@Controller('anime')
export class AnimeController {
  constructor(private readonly animeService: AnimeService) { }

  @Get('ranking')
  @ApiOperation({ summary: 'Listar recomendações do MyAnimeList com paginação' })
  @ApiQuery({ name: 'type', required: false, example: 'all', description: 'Filtro de ranking (Ex: all, bypopularity, airing)' })
  @ApiQuery({ name: 'page', required: false, example: 1, description: 'Número da página (Padrão: 1)' })
  @ApiQuery({ name: 'limit', required: false, example: 10, description: 'Quantidade de itens por página (Padrão: 10)' })
  async getRanking(
    @Query('type') type?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const paginaFormatada = page ? Number(page) : 1;
    const limiteFormatado = limit ? Number(limit) : 10;
    return this.animeService.getMalRanking(type || 'all', paginaFormatada, limiteFormatado);
  }

  @Get('search')
  @ApiOperation({ summary: 'Pesquisar animes no MyAnimeList com paginação' })
  @ApiQuery({ name: 'titulo', required: true })
  @ApiQuery({ name: 'page', required: false, example: 1, description: 'Número da página (Padrão: 1)' })
  @ApiQuery({ name: 'limit', required: false, example: 10, description: 'Quantidade de itens por página (Padrão: 10)' })
  async search(
    @Query('titulo') titulo: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const paginaFormatada = page ? Number(page) : 1;
    const limiteFormatado = limit ? Number(limit) : 10;
    return this.animeService.fetchMALData(titulo, paginaFormatada, limiteFormatado);
  }

  @Get('categoria')
  @ApiOperation({ summary: 'Listar os melhores animes por categoria/gênero com paginação' })
  @ApiQuery({
    name: 'genre',
    required: true,
    example: 'Romance',
    description: 'Nome do gênero em inglês (Ex: Action, Romance, Comedy, Drama, Isekai)'
  })
  @ApiQuery({
    name: 'page',
    required: false,
    example: 1,
    description: 'Número da página (Padrão: 1)'
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    example: 10,
    description: 'Quantidade de animes a retornar (Padrão: 10)'
  })
  async getPorCategoria(
    @Query('genre') genre: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const paginaFormatada = page ? Number(page) : 1;
    const limiteFormatado = limit ? Number(limit) : 10;
    return this.animeService.getTopAnimesByCategory(genre, paginaFormatada, limiteFormatado);
  }

  //  NOVA ROTA: Busca de animes por temporada e ano com paginação
  @Get('temporada/:ano/:season')
  @ApiOperation({ summary: 'Buscar animes por ano e temporada com paginação' })
  @ApiParam({ name: 'ano', required: true, example: 2024, description: 'Ano da temporada (ex: 2024)' })
  @ApiParam({ name: 'season', required: true, example: 'verao', description: 'Temporada (ex: inverno, primavera, verao, outono ou termos em inglês)' })
  @ApiQuery({ name: 'page', required: false, example: 1, description: 'Número da página (Padrão: 1)' })
  @ApiQuery({ name: 'limit', required: false, example: 10, description: 'Quantidade de itens por página (Padrão: 10)' })
  async getTemporada(
    @Param('ano', ParseIntPipe) ano: number,
    @Param('season') season: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const paginaFormatada = page ? Number(page) : 1;
    const limiteFormatado = limit ? Number(limit) : 10;
    return this.animeService.getSeasonalAnime(ano, season, paginaFormatada, limiteFormatado);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar detalhes de um anime específico pelo ID' })
  @ApiParam({ name: 'id', required: true, example: 5114, description: 'ID do anime no MyAnimeList' })
  async getById(@Param('id', ParseIntPipe) id: number) {
    return this.animeService.getAnimeById(id);
  }
}