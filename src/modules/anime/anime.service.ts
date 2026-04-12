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

  async fetchMALData(titulo: string) {
    try {
      const url = `${this.malApiUrl}/anime`;
      const response = await firstValueFrom(
        this.httpService.get(url, {
          params: {
            q: titulo,
            limit: 10,
            fields: 'id,title,main_picture,synopsis,mean,genres,start_date',
          },
          headers: { 'X-MAL-CLIENT-ID': this.malClientId },
        }),
      );

      const animesFormatados = response.data.data.map((item: any) => item.node);
      return await this.traduzirAnimes(animesFormatados);

    } catch (error) {
      throw new HttpException('Erro ao buscar dados no MyAnimeList', HttpStatus.BAD_GATEWAY);
    }
  }

  async getMalRanking(rankingType: string = 'all', limit: number = 10) {
    try {
      const url = `${this.malApiUrl}/anime/ranking`;
      const response = await firstValueFrom(
        this.httpService.get(url, {
          params: {
            ranking_type: rankingType,
            limit: limit,
            fields: 'id,title,main_picture,synopsis,mean,genres',
          },
          headers: { 'X-MAL-CLIENT-ID': this.malClientId },
        }),
      );

      const animesFormatados = response.data.data.map((item: any) => item.node);
      return await this.traduzirAnimes(animesFormatados);

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
            // Campos que você quer trazer
            fields: 'id,title,main_picture,synopsis,mean,genres,start_date,num_episodes,status',
          },
          headers: { 'X-MAL-CLIENT-ID': this.malClientId },
        }),
      );

      // A API retorna o objeto direto (sem o 'node' que as listas têm)
      const anime = response.data;

      // Colocamos em um array para reaproveitar a sua função de tradução e pegamos o primeiro item de volta
      const [animeTraduzido] = await this.traduzirAnimes([anime]);

      return animeTraduzido;

    } catch (error: any) {
      // Se o MAL retornar 404, repassamos esse 404
      if (error.response && error.response.status === 404) {
        throw new HttpException(`Anime com ID ${id} não encontrado.`, HttpStatus.NOT_FOUND);
      }
      throw new HttpException('Erro ao buscar anime pelo ID no MyAnimeList', HttpStatus.BAD_GATEWAY);
    }
  }
  // 👇 NOVO MÉTODO: Retorna os mais recomendados filtrados por categoria/gênero
  async getTopAnimesByCategory(category: string, limit: number = 10) {
    try {
      const url = `${this.malApiUrl}/anime/ranking`;
      
      // Buscamos um número maior (ex: 100) para ter margem suficiente para filtrar a categoria
      const response = await firstValueFrom(
        this.httpService.get(url, {
          params: {
            ranking_type: 'all', // Pega os melhores de todos os tempos
            limit: 100,          // Busca 100 opções
            fields: 'id,title,main_picture,synopsis,mean,genres',
          },
          headers: { 'X-MAL-CLIENT-ID': this.malClientId },
        }),
      );

      const todosAnimes = response.data.data.map((item: any) => item.node);

      // Filtra localmente verificando se o gênero bate com a categoria pedida
      const animesFiltrados = todosAnimes.filter((anime: any) => {
        if (!anime.genres) return false;
        
        // Verifica se a categoria buscada existe no array de gêneros do anime
        return anime.genres.some((genre: any) => 
          genre.name.toLowerCase().includes(category.toLowerCase())
        );
      });

      // Corta o array para retornar apenas a quantidade que você quer (limit)
      const animesLimitados = animesFiltrados.slice(0, limit);

      // Se não encontrar nada na categoria entre os top 100, pode lançar um erro 404
      if (animesLimitados.length === 0) {
        throw new HttpException(`Nenhum anime da categoria '${category}' encontrado no top 100.`, HttpStatus.NOT_FOUND);
      }

      // Traduz e retorna
      return await this.traduzirAnimes(animesLimitados);

    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException('Erro ao buscar categoria no MAL', HttpStatus.BAD_GATEWAY);
    }
  }
}