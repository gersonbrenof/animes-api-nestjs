import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
export class CreateAnimeDto {
  @ApiProperty({ example: 'Naruto', description: 'Título do anime' })
  titulo: string;

  @ApiProperty({ example: 'Anime de ninjas', description: 'Descrição do anime' })
  descricao: string;

  @ApiProperty({ example: 'Ação', description: 'Gênero do anime' })
  genero: string;

  @ApiProperty({ example: 'naruto.jpg', description: 'URL da foto', required: false })
  foto?: string; // 🔹 opcional

@ApiProperty({ example: 2002, required: false })
  @IsNumber()
  @Type(() => Number) // Garante que se vier texto "2002", vira número 2002
  @IsOptional()       // Opcional pois você colocou default: 0 no banco
  data_lancamento?: number;
}
