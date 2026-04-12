import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { AnimeService } from './anime.service';

@Injectable()
export class WatchLaterService {
  // A variável foi declarada assim:
  private userWatchLists: Record<string, any[]> = {};

  constructor(private readonly animeService: AnimeService) {}

  // Função auxiliar corrigida
  private getUserList(userId: string): any[] {
    // 👇 Corrigido aqui: troquei this.userLists por this.userWatchLists
    if (!this.userWatchLists[userId]) {
      this.userWatchLists[userId] = [];
    }
    return this.userWatchLists[userId];
  }

  async addToList(userId: string, animeId: number) {
    const list = this.getUserList(userId);

    const exists = list.find(a => a.id === animeId);
    if (exists) {
      throw new HttpException('Este anime já está na sua lista.', HttpStatus.BAD_REQUEST);
    }

    const anime = await this.animeService.getAnimeById(animeId);
    list.push(anime);

    return { message: `Anime '${anime.title}' adicionado à lista!` };
  }

  getWatchList(userId: string) {
    return this.getUserList(userId);
  }

  removeFromList(userId: string, animeId: number) {
    const list = this.getUserList(userId);
    const index = list.findIndex(a => a.id === animeId);

    if (index === -1) {
      throw new HttpException('Anime não encontrado na sua lista.', HttpStatus.NOT_FOUND);
    }

    const removed = list.splice(index, 1);
    return { message: `Anime '${removed[0].title}' removido da sua lista.` };
  }
}