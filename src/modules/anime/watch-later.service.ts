import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WatchLater } from './entities/watch-later.entity';
import { AnimeService } from './anime.service';
import Groq from 'groq-sdk';

@Injectable()
export class WatchLaterService {
  private groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

  constructor(
    @InjectRepository(WatchLater)
    private readonly watchLaterRepository: Repository<WatchLater>,
    private readonly animeService: AnimeService,
  ) {}

  async addToList(userId: string, animeId: number) {
    const exists = await this.watchLaterRepository.findOne({ where: { userId, animeId } });
    if (exists) {
      throw new HttpException('Este anime já está na sua lista.', HttpStatus.BAD_REQUEST);
    }

    const anime = await this.animeService.getAnimeById(animeId);
    
    // Salva o objeto completo no campo animeData
    const newItem = this.watchLaterRepository.create({ 
      userId, 
      animeId, 
      animeData: anime 
    });
    
    await this.watchLaterRepository.save(newItem);
    return { message: `Anime '${anime.title}' adicionado à lista!` };
  }

  async getWatchList(userId: string) {
    const list = await this.watchLaterRepository.find({ where: { userId } });
    return list.map(item => item.animeData);
  }

  async removeFromList(userId: string, animeId: number) {
    const result = await this.watchLaterRepository.delete({ userId, animeId });
    if (result.affected === 0) {
      throw new HttpException('Anime não encontrado na sua lista.', HttpStatus.NOT_FOUND);
    }
    return { message: 'Anime removido com sucesso.' };
  }

   async getRecommendations(userId: string) {
    // ✅ CORREÇÃO: Busque a lista diretamente do banco de dados
    const list = await this.watchLaterRepository.find({ where: { userId } });
    
    if (list.length === 0) {
      throw new HttpException('Adicione animes à lista para receber recomendações.', HttpStatus.BAD_REQUEST);
    }

    // Criamos uma string com os títulos dos animes salvos no banco
    const animeDetails = list.map(item => item.animeData.title).join(', ');

    try {
      const chatCompletion = await this.groq.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: `Você é um curador de animes especialista em análise de perfil de usuário. 
            Sua tarefa é analisar a lista do usuário: ${animeDetails}.
            1. Identifique os gêneros e temas dominantes.
            2. Recomende 5 animes que sejam "hidden gems" ou clássicos que combinem com esse gosto.
            3. Para cada recomendação, escreva uma justificativa curta.
            4. Responda em formato de lista numerada clara.`
          },
          {
            role: 'user',
            content: `Minha lista de interesse atual é: ${animeDetails}. Com base nisso, quais seriam os 5 animes perfeitos para eu assistir agora?`,
          },
        ],
        model: 'llama-3.1-8b-instant',
        temperature: 0.7,
      });

      return {
        recommendations: chatCompletion.choices[0]?.message?.content,
      };
    } catch (error) {
      console.error('Erro ao conectar com Groq:', error);
      throw new HttpException('Erro ao gerar recomendações inteligentes.', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}