import { IsString, IsNotEmpty, IsNumber, IsInt } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCommentDto {
  @ApiProperty({
    description: 'Conteúdo do comentário',
    example: 'Anime muito bom, a animação é incrível!',
  })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty({
    description: 'ID do anime onde o comentário será feito',
    example: 1,
  })
  @IsInt()
  @IsNotEmpty()
  animeId: number;
}