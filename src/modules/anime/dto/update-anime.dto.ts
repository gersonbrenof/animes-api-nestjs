import { PartialType } from '@nestjs/swagger';
import { CreateAnimeDto } from './create-anime.dto';

export class UpdateAnimeDto extends PartialType(CreateAnimeDto) {}