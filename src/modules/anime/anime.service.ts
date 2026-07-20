import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { translate } from 'google-translate-api-x';

@Injectable()
export class AnimeService {
  private readonly malApiUrl: string;
  private readonly malClientId: string;

  constructor(
    private httpService: HttpService,
    private configService: ConfigService,
  ) {
    this.malApiUrl = this.configService.get<string>('MAL_API_URL') as string;
    this.malClientId = this.configService.get<string>('MAL_CLIENT_ID') as string;
  }

  // Função auxiliar para traduzir a lista de animes
  private async traduzirAnimes(animes: any[]) {
    return await Promise.all(
      animes.map(async (anime) => {
        if (anime.synopsis) {
          try {
            const res: any = await translate(anime.synopsis, { from: 'en', to: 'pt' });
            anime.synopsis = res.text;
          } catch (error) {
            console.error(`Erro ao traduzir sinopse de ${anime.title}:`, (error as Error).message);
          }
        }
        return anime;
      })
    );
  }

  // 👇 AJUSTADO: Agora aceita page e limit para paginação de busca por texto
  async fetchMALData(titulo: string, page: number = 1, limit: number = 10) {
    try {
      const offset = (page - 1) * limit;
      const url = `${this.malApiUrl}/anime`;
      
      const response = await firstValueFrom(
        this.httpService.get(url, {
          params: {
            q: titulo,
            limit: limit,
            offset: offset,
            fields: 'id,title,main_picture,synopsis,mean,genres,start_date',
          },
          headers: { 'X-MAL-CLIENT-ID': this.malClientId },
        }),
      );

      const animesFormatados = response.data.data.map((item: any) => item.node);
      const animesTraduzidos = await this.traduzirAnimes(animesFormatados);

      // Retorna os dados envelopados com informações de paginação
      return {
        data: animesTraduzidos,
        pagination: {
          page,
          limit,
          hasNextPage: !!response.data.paging?.next, // Retorna true se houver uma próxima página na API do MAL
        }
      };

    } catch (error) {
      throw new HttpException('Erro ao buscar dados no MyAnimeList', HttpStatus.BAD_GATEWAY);
    }
  }

  // 👇 AJUSTADO: Paginação no Ranking
  async getMalRanking(rankingType: string = 'all', page: number = 1, limit: number = 10) {
    try {
      const offset = (page - 1) * limit;
      const url = `${this.malApiUrl}/anime/ranking`;
      
      const response = await firstValueFrom(
        this.httpService.get(url, {
          params: {
            ranking_type: rankingType,
            limit: limit,
            offset: offset,
            fields: 'id,title,main_picture,synopsis,mean,genres',
          },
          headers: { 'X-MAL-CLIENT-ID': this.malClientId },
        }),
      );

      const animesFormatados = response.data.data.map((item: any) => item.node);
      const animesTraduzidos = await this.traduzirAnimes(animesFormatados);

      return {
        data: animesTraduzidos,
        pagination: {
          page,
          limit,
          hasNextPage: !!response.data.paging?.next,
        }
      };

    } catch (error) {
      throw new HttpException('Erro ao buscar ranking no MAL', HttpStatus.BAD_GATEWAY);
    }
  }

  async getAnimeById(id: number) {
    try {
      const url = `${this.malApiUrl}/anime/${id}`;
      
      const response = await firstValueFrom(
        this.httpService.get(url, {
          params: {
            fields: 'id,title,main_picture,synopsis,mean,genres,start_date,num_episodes,status',
          },
          headers: { 'X-MAL-CLIENT-ID': this.malClientId },
        }),
      );

      const anime = response.data;
      const [animeTraduzido] = await this.traduzirAnimes([anime]);

      return animeTraduzido;

    } catch (error: any) {
      if (error.response && error.response.status === 404) {
        throw new HttpException(`Anime com ID ${id} não encontrado.`, HttpStatus.NOT_FOUND);
      }
      throw new HttpException('Erro ao buscar anime pelo ID no MyAnimeList', HttpStatus.BAD_GATEWAY);
    }
  }
    

  private mapearTemporada(temporada: string): string {
    // Remove acentos e converte para letras minúsculas (ex: "Verão" vira "verao")
    const t = temporada
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

    if (t.includes('inverno') || t.includes('winter') || t.includes('inerveo')) return 'winter';
    if (t.includes('primavera') || t.includes('spring') || t.includes('primeira')) return 'spring';
    if (t.includes('verao') || t.includes('summer') || t.includes('verio')) return 'summer';
    if (t.includes('outono') || t.includes('fall') || t.includes('autumn')) return 'fall';
    
    // Fallback caso seja enviado o termo correto em inglês diretamente
    return t; 
  }

  // Método para buscar os animes por ano e temporada
  async getSeasonalAnime(year: number, season: string, page: number = 1, limit: number = 10) {
    try {
      const mappedSeason = this.mapearTemporada(season);
      const offset = (page - 1) * limit;
      const url = `${this.malApiUrl}/anime/season/${year}/${mappedSeason}`;

      const response = await firstValueFrom(
        this.httpService.get(url, {
          params: {
            limit: limit,
            offset: offset,
            fields: 'id,title,main_picture,synopsis,mean,genres,start_date',
          },
          headers: { 'X-MAL-CLIENT-ID': this.malClientId },
        }),
      );

      const animesFormatados = response.data.data.map((item: any) => item.node);
      const animesTraduzidos = await this.traduzirAnimes(animesFormatados);

      return {
        data: animesTraduzidos,
        pagination: {
          page,
          limit,
          hasNextPage: !!response.data.paging?.next,
        }
      };

    } catch (error) {
      throw new HttpException(
        'Erro ao buscar animes da temporada no MyAnimeList', 
        HttpStatus.BAD_GATEWAY
      );
    }
  }
  //  AJUSTADO: Paginação local aplicada sobre a busca de categorias filtradas dos Top 100
  async getTopAnimesByCategory(category: string, page: number = 1, limit: number = 10) {
    try {
      const url = `${this.malApiUrl}/anime/ranking`;
      
      // Buscamos um número fixo (ex: 100) para filtrar localmente por gênero
      const response = await firstValueFrom(
        this.httpService.get(url, {
          params: {
            ranking_type: 'all',
            limit: 100, // Mantém-se alto para dar margem para o filtro
            fields: 'id,title,main_picture,synopsis,mean,genres',
          },
          headers: { 'X-MAL-CLIENT-ID': this.malClientId },
        }),
      );

      const todosAnimes = response.data.data.map((item: any) => item.node);

      // Filtro local por categoria
      const animesFiltrados = todosAnimes.filter((anime: any) => {
        if (!anime.genres) return false;
        return anime.genres.some((genre: any) => 
          genre.name.toLowerCase().includes(category.toLowerCase())
        );
      });

      // Cálculo da paginação local sobre a lista filtrada
      const totalFiltrados = animesFiltrados.length;
      const offset = (page - 1) * limit;
      const animesPaginados = animesFiltrados.slice(offset, offset + limit);

      if (animesPaginados.length === 0) {
        throw new HttpException(`Nenhum anime encontrado para a página ${page} na categoria '${category}'.`, HttpStatus.NOT_FOUND);
      }

      const animesTraduzidos = await this.traduzirAnimes(animesPaginados);

      return {
        data: animesTraduzidos,
        pagination: {
          page,
          limit,
          total: totalFiltrados,
          hasNextPage: offset + limit < totalFiltrados,
        }
      };

    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException('Erro ao buscar categoria no MAL', HttpStatus.BAD_GATEWAY);
    }
  }
}