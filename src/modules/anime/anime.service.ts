import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { Anime } from './entities/anime.entity';
import { CreateAnimeDto } from './dto/create-anime.dto';
import { UpdateAnimeDto } from './dto/update-anime.dto';

@Injectable()
export class AnimeService {
  constructor(
    @InjectRepository(Anime)
    private animeRepository: Repository<Anime>,
  ) { }

  create(createAnimeDto: CreateAnimeDto) {
    const anime = this.animeRepository.create(createAnimeDto);
    return this.animeRepository.save(anime);
  }

  findAll(titulo?: string, genero?: string) {
    const where: any = {};
    if (titulo) {
      where.titulo = Like(`%${titulo}%`);
    }
    if (genero) {
      where.genero = Like(`%${genero}%`);
    }
    return this.animeRepository.find({
      where,
      order: { id: 'ASC' }
    });
  }

  findOne(id: number) {
    return this.animeRepository.findOne({ where: { id } });
  }

  update(id: number, updateAnimeDto: UpdateAnimeDto) {
    return this.animeRepository.update(id, updateAnimeDto);
  }

  remove(id: number) {
    return this.animeRepository.delete(id);
  }
}