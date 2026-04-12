import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCommentDto {
  @ApiProperty({ description: 'O ID do anime lá no MyAnimeList', example: 34572 })
  @IsNumber()
  @IsNotEmpty()
  animeId!: number;

  @ApiProperty({ description: 'Texto do comentário', example: 'Achei esse anime incrível!' })
  @IsString()
  @IsNotEmpty()
  content!: string;
}