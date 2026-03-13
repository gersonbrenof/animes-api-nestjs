import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsNotEmpty, Min, Max, IsInt } from 'class-validator';

export class CreateEvaluationDto {
  @ApiProperty({
    description: 'Nota atribuída ao anime (de 0 a 10)',
    example: 8.5,
    minimum: 0,
    maximum: 10,
  })
  @IsNumber()
  @Min(0)
  @Max(10)
  @IsNotEmpty()
  rating: number;

  @ApiProperty({
    description: 'ID do anime que está sendo avaliado',
    example: 1,
  })
  @IsNumber() // Recomendado: use @IsInt() se o ID for sempre inteiro
  @IsNotEmpty()
  animeId: number;
}