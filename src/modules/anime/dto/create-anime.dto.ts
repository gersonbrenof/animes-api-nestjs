
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateAnimeDto {
  @ApiProperty({ example: 'Naruto' })
  @IsString()
  @IsNotEmpty()
  titulo: string; // Só precisamos disso!
}