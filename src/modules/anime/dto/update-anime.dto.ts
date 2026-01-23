import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
export class UpdateAnimeDto {
  @ApiPropertyOptional({ example: 'Naruto', description: 'Título do anime' })
  titulo?: string;

  @ApiPropertyOptional({ example: 'Anime de ninjas', description: 'Descrição do anime' })
  descricao?: string;

  @ApiPropertyOptional({ example: 'Ação', description: 'Gênero do anime' })
  genero?: string;

  @ApiPropertyOptional({ example: 'naruto.jpg', description: 'URL da foto' })
  foto?: string;

 @ApiProperty({ example: 2002, required: false })
@IsNumber()
@Type(() => Number) // Garante que se vier texto "2002", vira número 2002
@IsOptional()       // Opcional pois você colocou default: 0 no banco
data_lancamento?: number;
}
